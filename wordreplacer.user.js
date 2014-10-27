// ==UserScript==
// @name Word Replacer
// @namespace wordreplacer
// @description Replaces instances of a word with another word on 4chan. Ported from and Inspired by panicsteve's cloud-to-butt extension for Google Chrome, and DaveRandom's ports thereof.
// @include *
// @version 1.0.1
// @grant none
// ==/UserScript==


(function() {

    function walk(node) 
    {
        // I stole this function from here:
        // http://is.gd/mwZp7E
    
        var child, next;
    
        switch ( node.nodeType )  
        {
            case 1:  // Element
            case 9:  // Document
            case 11: // Document fragment
                child = node.firstChild;
                while ( child ) 
                {
                    next = child.nextSibling;
                    walk(child);
                    child = next;
                }
                break;
    
            case 3: // Text node
                handleText(node);
                break;
        }
    }
    
    function handleText(textNode)
    {
        var v = textNode.nodeValue;
    
        v = v.replace(/\bword\b/g, "otherword");
        v = v.replace(/\bWord\b/g, "Otherword");
        v = v.replace(/\bWORD\b/g, "OTHERWORD");
    
        textNode.nodeValue = v;
    }
function dothat() {
    walk(document.getElementsByTagName('body')[0]);
    walk(document.getElementsByTagName('title')[0]);
}

document.addEventListener('NamesSynced',dothat);
}());