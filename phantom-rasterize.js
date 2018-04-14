var page = require('webpage').create(),
    system = require('system'),
    args = require('system').args,
    address, isDebug, output, size;

/*phantom settings*/
phantom.cookiesEnabled = true;


//print out console logs on page level
page.onConsoleMessage = function (msg) {
    if (msg.indexOf("Unsafe JavaScript attempt to access frame with URL") > -1){
        return;
    }
    if(isDebug){
        console.log('CONSOLE: ' + msg);
    }
};

page.onAlert = function (msg) {
    //ignore alerts
    //console.log('ALERT: ' + msg);
};

//error tracing
page.onError = function(msg, trace) {
    // Just log page errors
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file||t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    return;
};

phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file||t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit();
};



if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log(' paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
} else {
    address = args[1];
    output = args[2];
    isDebug = args[5] === "true";
    /*render settings*/
    page.zoomFactor = 1;
    page.viewportSize = { width: 600, height: 600 };
    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 200);
        }
    });
}