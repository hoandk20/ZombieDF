package com.zombiedf.barricadenights;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.GetBillingConfigParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Cầu nối tối giản tới Google Play Billing cho một sản phẩm mua một lần (mở khoá bản đầy đủ).
 * JS gọi: init() → { country }, getProduct({ id }) → { price }, purchase({ id }) → { status }, restore() → { owned: [...] }.
 */
@CapacitorPlugin(name = "Billing")
public class BillingPlugin extends Plugin {
    private BillingClient client;
    private boolean connected = false;
    private PluginCall pendingPurchase;

    @Override
    public void load() {
        client = BillingClient.newBuilder(getContext())
            .setListener((result, purchases) -> onPurchasesUpdated(result, purchases))
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build();
    }

    private interface Ready { void run(); }

    private void withConnection(PluginCall call, Ready ready) {
        if (connected && client.isReady()) { ready.run(); return; }
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    connected = true;
                    ready.run();
                } else {
                    call.reject("billing_unavailable: " + result.getDebugMessage(), String.valueOf(result.getResponseCode()));
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                connected = false;
            }
        });
    }

    @PluginMethod
    public void init(PluginCall call) {
        withConnection(call, () -> client.getBillingConfigAsync(GetBillingConfigParams.newBuilder().build(), (result, config) -> {
            JSObject ret = new JSObject();
            ret.put("country", config != null ? config.getCountryCode() : "");
            call.resolve(ret);
        }));
    }

    private void queryProduct(String id, PluginCall call, ProductCallback cb) {
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(id)
                .setProductType(BillingClient.ProductType.INAPP)
                .build()))
            .build();
        client.queryProductDetailsAsync(params, (result, details) -> {
            List<ProductDetails> list = details != null ? details.getProductDetailsList() : null;
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || list == null || list.isEmpty()) {
                call.reject("product_not_found: " + result.getDebugMessage());
                return;
            }
            cb.got(list.get(0));
        });
    }

    private interface ProductCallback { void got(ProductDetails pd); }

    @PluginMethod
    public void getProduct(PluginCall call) {
        String id = call.getString("id");
        withConnection(call, () -> queryProduct(id, call, pd -> {
            JSObject ret = new JSObject();
            ProductDetails.OneTimePurchaseOfferDetails offer = pd.getOneTimePurchaseOfferDetails();
            ret.put("price", offer != null ? offer.getFormattedPrice() : "");
            ret.put("title", pd.getName());
            call.resolve(ret);
        }));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String id = call.getString("id");
        withConnection(call, () -> queryProduct(id, call, pd -> {
            if (pendingPurchase != null) pendingPurchase.reject("superseded");
            pendingPurchase = call;
            BillingFlowParams flow = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(
                    BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(pd).build()))
                .build();
            getActivity().runOnUiThread(() -> {
                BillingResult r = client.launchBillingFlow(getActivity(), flow);
                if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) finishPurchase(statusFor(r), null);
            });
        }));
    }

    @PluginMethod
    public void restore(PluginCall call) {
        withConnection(call, () -> client.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("restore_failed: " + result.getDebugMessage());
                    return;
                }
                JSArray owned = new JSArray();
                for (Purchase p : purchases) {
                    if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                    acknowledge(p);
                    for (String id : p.getProducts()) owned.put(id);
                }
                JSObject ret = new JSObject();
                ret.put("owned", owned);
                call.resolve(ret);
            }));
    }

    private void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            List<String> owned = new ArrayList<>();
            boolean pending = false;
            for (Purchase p : purchases) {
                if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    acknowledge(p);
                    owned.addAll(p.getProducts());
                } else if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                    pending = true;
                }
            }
            finishPurchase(!owned.isEmpty() ? "purchased" : pending ? "pending" : "error", owned);
        } else {
            finishPurchase(statusFor(result), null);
        }
    }

    private String statusFor(BillingResult r) {
        switch (r.getResponseCode()) {
            case BillingClient.BillingResponseCode.USER_CANCELED: return "canceled";
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED: return "owned";
            default: return "error";
        }
    }

    private void finishPurchase(String status, List<String> owned) {
        if (pendingPurchase == null) return;
        JSObject ret = new JSObject();
        ret.put("status", status);
        JSArray arr = new JSArray();
        if (owned != null) for (String id : owned) arr.put(id);
        ret.put("owned", arr);
        pendingPurchase.resolve(ret);
        pendingPurchase = null;
    }

    // Google hoàn tiền tự động nếu giao dịch không được xác nhận trong 3 ngày
    private void acknowledge(Purchase p) {
        if (p.isAcknowledged()) return;
        client.acknowledgePurchase(
            AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),
            r -> { });
    }
}
