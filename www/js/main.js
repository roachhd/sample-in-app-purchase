// Our application's global object
//var app = {};


var initialize = function() {
    log('initialize');

    // Listen to the deviceready event.
    //document.addEventListener('deviceready', this.bind(this.onDeviceReady), false);
    document.addEventListener('deviceready', onDeviceReady, false);
};

// deviceready event handler.
// initialize the In-App Purchase Cordova plugin
var onDeviceReady = function() {
    log('onDeviceReady');
    initStore();
};

// initialize the purchase plugin if available
var initStore = function() {
    if (!window.store) {
        log('Store not available');
        return;
    }

    // Inform the store of your products
    log('registerProducts');
    store.register({
        id:    'com.mcc.appleiap.100coins',
        alias: '100 coins',
        type:   store.CONSUMABLE
    });
    
    store.register({
        id:    'com.mcc.appleiap.fullversion',
        alias: 'full version',
        type:   store.NON_CONSUMABLE
    });

    // When any product gets updated, refresh the In-App Purchase UI elements.
    store.when("product").updated(function (product_item) {
        renderIAP(product_item);
    });

    // Log all errors
    store.error(function(error) {
        log('ERROR ' + error.code + ': ' + error.message);
    });

    // When a 100 coins package purchase is approved,
    // display in the log and finish the transaction.
    store.when("100 coins").approved(function (order) {
        log("You got an 100 coins!");
        order.finish();
    });

    // When the full version purchase is approved,
    // display in the log and finish the transaction.
    store.when("full version").approved(function (order) {
        log('You just unlocked the FULL VERSION!');
        order.finish();
    });

    // Display the Full Version indicator only when owned
    store.when("full version").updated(function (product) {
        document.getElementById("full_version_indicator").style.display =
            product.owned ? "block" : "none";
    });

    // Refresh the store.
    // This will contact the server to check all registered products
    // validity and ownership status.
    // Recommendation: Execute only at application startup, as it could be
    // pretty excessive.
    log('refresh store connection for purchase validation');
    store.refresh();
};

var renderIAP = function(product_item) {

    var element_Id = product_item.id.split(".")[3];

    var el = document.getElementById(element_Id + '_purchase');
    if (!el) return;

    if (!product_item.loaded) {
        el.innerHTML = '<h3>...</h3>';
    }
    else if (!product_item.valid) {
        el.innerHTML = '<h3>' + product_item.alias + ' Invalid</h3>';
    }
    else if (product_item.valid) {
        var html = "<h3>" + product_item.title + "</h3>";
        if (product_item.title != product_item.description) {
            html += "<p>" + product_item.description + "</p>";
        }
        if (product_item.canPurchase) {
            html += "<a class='block button' id='buy-" + product_item.id + "' productId='" + product_item.id + "'>" + product_item.price + "</a>";
        }
        el.innerHTML = html;
        if (product_item.canPurchase) {
            document.getElementById("buy-" + product_item.id).onclick = function (event) {
                var pid = this.getAttribute("productId");
                store.order(pid);
            };
        }
    }
};

// log both in the console and in the HTML #log element.
var log = function(arg) {
    try {
        if (typeof arg !== 'string')
            arg = JSON.stringify(arg);
        console.log(arg);
        document.getElementById('log').innerHTML += '<div>' + arg + '</div>';
    } catch (e) {}
};

initialize();