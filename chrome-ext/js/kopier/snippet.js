var Snippet = function(data) {    
    this.snippetid = undefined;
    this.html = undefined;
    this.text = undefined;
    this.compressedHtml = undefined;
    this.compressedText = undefined;
    this.copiedFrom = undefined;
    this.userid = undefined;
    this.images = [];
    this.order = undefined;
    
    this.setSnippetId = function(snippetid) {
        this.snippetid = snippetid;
    }
    
    this.setHtml = function(html, is_commpressed = false) {
        if(!is_commpressed) {
            this.html = html;
            this.compressedHtml = utf8_to_b64(html);
        } else {
            this.html = b64_to_utf8(html);
            this.compressedHtml = html;
        }
    }
    
    this.setText = function(text, is_commpressed = false) {
        if(!is_commpressed) {
            this.text = text;
            this.compressedText = utf8_to_b64(text);
        } else {
            this.text = b64_to_utf8(text);
            this.compressedText = text;
        }
    }
    
    this.setCopiedFrom = function(copiedFrom) {
        this.copiedFrom = copiedFrom;
    }
    
    this.setUserid = function(userid) {
        this.userid = userid;
    }
    
    this.setImages = function(images) {
        this.images = images;
    }
    
    this.setOrder = function(order) {
        this.order = order;
    }
    
    this.getData = function() {
        return {
            snippetid : this.snippetid,
            html : this.compressedHtml,
            text : this.compressedText,
            copiedFrom : this.copiedFrom,
            userid : this.userid,
            images : this.images,
            order : this.order
        }
    }
        
    return {
        snippetid : this.snippetid,
        html : this.html,
        text : this.text,
        copiedFrom : this.copiedFrom,
        userid : this.userid,
        images : this.images,
        order : this.order,
        compressedHtml : this.compressedHtml,
        compressedText : this.compressedText,
        setSnippetId : this.setSnippetId,
        setHtml : this.setHtml,
        setText : this.setText,
        setCopiedFrom : this.setCopiedFrom,
        setUserid : this.setUserid,
        setImages : this.setImages,        
        setOrder : this.setOrder,
        getData : this.getData
        
    }
};

var SnippetCollection = function() {
    this.collection = [];
    this.add = function(snippet) {
        this.collection.push(snippet);
    }
    this.remove = function(snippet) {
        var temp = [];
        for(var i = 0 ; i < this.collection.length ; i++) {
            if(this.collection[i].snippetid != snippet.snippetid)
                temp.push(this.collection[i]);
        }
        this.collection = temp;
    }
    this.removeById = function(snippetid) {
        var temp = [];
        for(var i = 0 ; i < this.collection.length ; i++) {
            if(this.collection[i].snippetid != snippetid)
                temp.push(this.collection[i]);
        }
        this.collection = temp;
    }
    this.reorder = function() {
        //have to think about this
    }
}