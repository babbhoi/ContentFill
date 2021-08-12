// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 500);
var prefix = "";
const array_inst = [];
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
//fetchContent('http://localhost:3000/users');
//const url='https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';
//const url='https://cdn.fakercloud.com/avatars/levisan_128.jpg';
const url = 'https://cdn.sharechat.com/%E0%A4%AB%E0%A5%8B%E0%A4%9F%E0%A5%8B%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%AB%E0%A5%80_285abea6_1625625260495_sc_cmprsd_40.jpg';
figma.ui.postMessage({ type: 'networkRequest', });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'loaded') {
        handleselection();
    }
    if (msg.type === 'clone') {
        //empty array_inst
        while (array_inst.length != 0) {
            array_inst.pop();
        }
        for (const d of msg.selop) {
            console.log(d.type);
        }
        var count = msg.quantity;
        if (msg.selop.length != 0 && figma.currentPage.selection.length == 1) {
            for (const c of msg.data) {
                for (const d of msg.selop) {
                    const node = getNode(figma.currentPage.selection[0], d.id);
                    if (node) {
                        // if(d.type=='img')
                        //   {console.log('image update handle');
                        //     updateFill(node,url);
                        // }
                        // else
                        if (d.type == 'txt') {
                            try {
                                yield updateText(node, c[d.value]);
                            }
                            catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
                //clone 
                const nodeStore = figma.currentPage.selection[0].clone();
                figma.currentPage.selection[0].x += nodeStore.width + 24;
                array_inst.push(nodeStore);
                // update image 
                for (const d of msg.selop) {
                    const node = getNode(figma.currentPage.selection[0], d.id);
                    if (node) {
                        const id = getCorId(figma.currentPage.selection[0], nodeStore, d.id);
                        if (d.type == 'img') { //console.log('image update handle');
                            updateFill(nodeStore.id, id, c[d.value]);
                        }
                    }
                }
                count--;
                if (count == 0)
                    break;
            }
        }
    }
    if (msg.type === 'newimage') {
        const parent = getParent(array_inst, msg.pid);
        const node = getNode(parent, msg.id);
        //fill node with image
        const newfills = [];
        console.log(node.fills);
        for (const g of node.fills) {
            if (g.type == 'IMAGE') {
                console.log(g.type);
                const imgfill = figma.createImage(msg.newBytes);
                const newimgfill = Object.assign(Object.assign({}, g), { imageHash: imgfill.hash });
                newfills.push(newimgfill);
            }
            else {
                newfills.push(g);
            }
        }
        node.fills = [...newfills];
    }
    if (msg.type === 'newApiFetched') {
        //console.log("update by api change")
        handleselection();
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    //figma.closePlugin();
});
figma.on('selectionchange', handleselection);
function handleselection() {
    //console.log("update by api change")
    if (figma.currentPage.selection.length == 1) {
        //Extracting all required layers
        const selected = [];
        for (const nd of figma.currentPage.selection) {
            selected.push(nd);
        }
        const newselect = [];
        while (selected.length != 0) {
            const l1 = selected.pop();
            if (l1.type == 'TEXT' && prefixCheck(l1, prefix))
                newselect.push({ name: l1.name, id: l1.id, type: "txt" });
            else if ((l1.type == 'RECTANGLE' || l1.type == 'ELLIPSE' || l1.type == 'VECTOR') && hasImageFill(l1) && prefixCheck(l1, prefix)) {
                newselect.push({ name: l1.name, id: l1.id, type: "img" });
            }
            else if (l1.type == 'FRAME' || l1.type == 'GROUP' || l1.type == 'COMPONENT' || l1.type == 'INSTANCE') {
                for (const l2 of l1.children) {
                    selected.push(l2);
                }
            }
            if ((l1.type == 'FRAME' || l1.type == 'COMPONENT' || l1.type == 'INSTANCE') && hasImageFill(l1) && prefixCheck(l1, prefix)) {
                newselect.push({ name: l1.name, id: l1.id, type: "img" });
            }
        }
        //const nam=figma.currentPage.selection[0].name;
        figma.ui.postMessage({ type: 'selected', newselect });
    }
}
function getNode(node, id) {
    const newnode = [];
    newnode.push(node);
    while (newnode.length != 0) {
        const n = newnode.pop();
        if (n.id == id)
            return n;
        else if (n.type == 'FRAME' || n.type == 'GROUP' || n.type == 'COMPONENT' || n.type == 'INSTANCE') {
            for (const c of n.children) {
                newnode.push(c);
            }
        }
    }
    return;
}
function getCorId(node, cnode, id) {
    const newnode = [];
    const cnewnode = [];
    newnode.push(node);
    cnewnode.push(cnode);
    while (newnode.length != 0) {
        const n = newnode.pop();
        const m = cnewnode.pop();
        if (n.id == id)
            return m.id;
        else if (n.type == 'FRAME' || n.type == 'GROUP' || n.type == 'COMPONENT' || n.type == 'INSTANCE') {
            for (const c of n.children) {
                newnode.push(c);
            }
            for (const c of m.children) {
                cnewnode.push(c);
            }
        }
    }
    return;
}
function updateText(node, txt) {
    return __awaiter(this, void 0, void 0, function* () {
        if (node.type == 'TEXT') {
            try {
                yield figma.loadFontAsync(node.getRangeFontName(0, 1));
                var title = node.name;
                node.characters = "" + txt;
                node.name = title;
            }
            catch (e) {
                console.log(e);
            }
        }
    });
}
function updateFill(pid, id, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            figma.ui.postMessage({ type: 'image', url, pid, id });
        }
        catch (e) {
            console.log(e);
        }
    });
}
function hasImageFill(node) {
    for (const p of node.fills) {
        if (p.type == 'IMAGE')
            return true;
    }
    return false;
}
function prefixCheck(node, prefix) {
    if (prefix == "")
        return true;
    else {
        const name = node.name;
        return (name.charAt(0) == prefix);
    }
}
function getParent(arr, id) {
    for (const c of arr) {
        if (c.id == id)
            return c;
    }
}
