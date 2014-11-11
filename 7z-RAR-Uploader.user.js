// ==UserScript==
// @name        4chan 7z/RAR uploader
// @namespace   03439702a2904cac964aa322ffcb6a00
// @description Converts non-image files into Cornelia-style PNGs so they can be uploaded to 4chan.
// @license     Public domain
// @match       *://boards.4chan.org/*
// @match       *://sys.4chan.org/*
// @grant       none
// @version     1.0.0
// @icon        data:image/png;base64,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
// ==/UserScript==

var MAGIC_7Z = "7z\xBC\xAF\x27\x1C";

var crc_table = [];
for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) {
        if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    crc_table[n] = c;
}

function mkInt(x, n) {
    var s = "";
    for (var i = 0; i < n; i++) {
        s += String.fromCharCode(x & 0xFF);
        x >>= 8;
    }
    return s;
}

function crc32(s) {
    var crc = -1;
    for (var i = 0; i < s.length; i++) {
        var b = s.charCodeAt(i);
        crc = crc_table[(crc ^ b) & 0xff] ^ (crc >>> 8);
    }
    return mkInt(crc ^ -1, 4);
}

function mkInt7z(x) {
    var s = "";
    var mask = 0xFF;
    while (x > (mask >> 1)) {
        s += String.fromCharCode(x & 0xFF);
        x >>= 8;
        mask >>= 1;
    }
    return String.fromCharCode(0xFF - mask + x) + s;
}

function rdInt(s) {
    var n = 0;
    var x = 1;
    for (var i = 0; i < s.length; i++) {
        n += s.charCodeAt(i) * x;
        x <<= 8;
    }
    return n;
}

var postForm = document.getElementsByName("post")[0];
var upfile = document.getElementById("postFile");
var submitButton = document.evaluate('.//input[@type="submit"]', postForm, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
var resultBlob;
var previewURL;

// Determine whether file is applicable for conversion
function applicable() {
    if (upfile.files.length != 1) return false;
    var name = upfile.files[0].name;
    var board = location.pathname.split("/")[1];
    if (board == "f") {
        return false;
    } else if (board == "po" || board == "tg") {
        return !/\.(gif|jpe?g|png|pdf)$/i.test(name);
    } else {
        return !/\.(gif|jpe?g|png)$/i.test(name);
    }
}

// Determine whether to intercept file
function intercept() {
    return applicable() && enableBox.checked;
}

// Generate archive
function genArchive(callback) {
    if (!intercept()) return;
    if (resultBlob != undefined) {
        callback();
        return;
    }

    var fr = new FileReader();

    // Wait for file to be read
    fr.onload = function(e) {
        var data = e.target.result;
        var name = upfile.files[0].name;
        var haveTop = (topFile.files.length == 1);

        // If not an archive, wrap in uncompressed 7z file
        if (data.substr(0, 6) == MAGIC_7Z) {
            // Split 7z archives must be wrapped
            var fullLen = 32 + rdInt(data.substr(12, 8)) + rdInt(data.substr(20, 8));
            var noWrap = (data.length >= fullLen);
        } else {
            var noWrap = (data.substr(0, 4) == "Rar!");
        }
        if (!noWrap) {
            var nameField = "\x00";
            for (var i = 0; i < name.length; i++) {
                var n = name.charCodeAt(i);
                nameField += String.fromCharCode(n & 0xFF);
                nameField += String.fromCharCode((n >> 8) & 0xFF);
            }
            nameField += "\0\0";
            var head =
                "\x01\x04" + "\x06\x00\x01\x09" + mkInt7z(data.length) + "\0"
                + "\x07\x0B\x01\x00\x01\x01\x00\x0C" + mkInt7z(data.length) + "\0"
                + "\x08\0" + "\0"
                + "\x05\x01\x11" + mkInt7z(nameField.length) + nameField + "\0\0";
            var sig2 = mkInt(data.length, 8) + mkInt(head.length, 8) + crc32(head);
            var sig = MAGIC_7Z + "\x00\x03" + crc32(sig2) + sig2;
            data = sig + data + head;
        }

        // Wait for top section to load
        function topLoaded() {
            // Create BMP file containing archive
            var width0 = Math.sqrt(data.length/3);
            if (haveTop) {
                width0 *= 2;
                if (width0 < topImg.width) width0 = topImg.width;
            }
            var width = 4*Math.ceil(width0/4);
            var height = Math.ceil(data.length/3/width);
            var bmpData = "BM" + mkInt(width*height+54, 4)
                + "\0\0\0\0\x36\0\0\0\x28\0\0\0" + mkInt(width, 4) + mkInt(height, 4)
                + "\x01\0\x18\0\0\0\0\0" + mkInt(width*height, 4)
                + Array(17+3*width*height-data.length).join("\0") + data;
            var bmpURI = "data:image/bmp;base64," + btoa(bmpData);
            var img = new Image();

            // Wait for BMP image to load
            img.onload = function() {
                // Draw images to canvas
                if (haveTop) {
                    var topHeight = Math.round(topImg.height * width / topImg.width);
                } else {
                    var topHeight = 0;
                }
                var can = document.createElement("canvas");
                can.width = width;
                can.height = topHeight + height;
                var ctx = can.getContext("2d");
                ctx.drawImage(img, 0, topHeight);
                if (haveTop) {
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.drawImage(topImg, 0, 0, width, topHeight);
                }

                // Convert canvas to PNG file
                var name2 = name.replace(/\.\d+$/, "").replace(/\.[^\.]*$/, "") + ".png";
                if (can.mozGetAsFile != undefined) {
                    resultBlob = can.mozGetAsFile(name2, "image/png");
                } else {
                    var pngData = can.toDataURL("image/png");
                    pngData = atob(pngData.substr(pngData.indexOf(",") + 1));
                    var arr = new Uint8Array(pngData.length);
                    for (var i = 0; i < pngData.length; i++) arr[i] = pngData.charCodeAt(i);
                    resultBlob = new Blob([arr], {type: "image/png"});
                }

                callback();
            };

            img.src = bmpURI;
        }

        if (haveTop) {
            var topImg = new Image();
            topImg.onload = topLoaded;
            topImg.src = URL.createObjectURL(topFile.files[0]);
        } else {
            topLoaded();
        }
    };

    fr.readAsBinaryString(upfile.files[0]);
}

// Enable checkbox
var enableBox = document.createElement("input");
enableBox.id = "enableConvertCornelia";
enableBox.type = "checkbox";
enableBox.className = "fileOperation";
function enableUpdate() {
    if (enableBox.checked) {
        var others = document.getElementsByClassName("fileOperation");
        for (var i = 0; i < others.length; i++) {
            if (others[i] != enableBox) others[i].checked = false;
        }
    }
}
enableBox.addEventListener("change", enableUpdate, false);

// Controls
var controls = document.createElement("span");
controls.innerHTML = '<label for="enableConvertCornelia">Upload as Cornelia-style archive</label>';

// Hideable Controls
var hideables = document.createElement("span");
hideables.id = "controlsConvertCornelia";
hideables.style.display = "none";
var ss = document.createElement("style");
ss.type = "text/css";
ss.textContent = "#enableConvertCornelia:checked ~ span > #controlsConvertCornelia {display: inline !important;}";
document.head.appendChild(ss);
controls.appendChild(hideables);

// Preview button
var preview = document.createElement("a");
preview.textContent = " [preview/save]";
preview.addEventListener("click", function(e) {
    genArchive(function() {
        previewURL = URL.createObjectURL(resultBlob);
        open(previewURL, "_blank");
    });
}, false);
hideables.appendChild(preview);
hideables.appendChild(document.createElement("br"));

// Thumbnail field
var topFile = document.createElement("input");
topFile.type = "file";
hideables.appendChild(document.createTextNode("Thumbnail: "));
hideables.appendChild(topFile);
controls.appendChild(document.createElement("br"));

// Watch for form updates
function clearResults() {
    resultBlob = undefined;
    if (previewURL != undefined) URL.revokeObjectURL(previewURL);
    previewURL = undefined;
}
function removeEl(node) {
    if (node.parentNode != null) node.parentNode.removeChild(node);
}
upfile.addEventListener("change", function(e) {
    clearResults();
    if (applicable()) {
        upfile.parentNode.insertBefore(enableBox, upfile);
        upfile.parentNode.insertBefore(controls, upfile);
        enableBox.checked = (document.getElementsByClassName("fileOperation").length == 1);
        enableUpdate();
    } else {
        removeEl(enableBox);
        removeEl(controls);
    }
}, false);
topFile.addEventListener("change", function(e) {
    clearResults();
}, false);

// Capture form submit
postForm.addEventListener("submit", function(e) {
    if (intercept()) {
        e.preventDefault();
        submitButton.value = "Converting...";
        genArchive(function() {
            // Check size
            var maxSize = parseInt(document.getElementsByName("MAX_FILE_SIZE")[0].value);
            if (resultBlob.size > maxSize) {
                alert("Result too large to upload (" + resultBlob.size + " bytes)");
                submitButton.value = "Submit";
                return;
            }

            // Edit and post form
            upfile.name = "";
            var fd = new FormData(postForm);
            fd.append("upfile", resultBlob);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", postForm.action);

            // Display response
            xhr.onload = function(e) {
                var rt = xhr.responseText;
                location.href = "data:text/html;base64," + btoa(unescape(encodeURIComponent(rt)));
            }
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    submitButton.value = "Uploading (" + Math.round(100 * e.loaded / e.total) + "%)";
                }
            }
            submitButton.value = "Uploading...";
            xhr.send(fd);
        });
    }
}, false);
