/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-8-31
 * Time: 下午10:09
 * To change this template use File | Settings | File Templates.
 */
function PopUpOption(text, callback, image){
    this.text = text;
    this.callback = callback;
}
function PopUp(image, options){
    var container = document.createElement("div");
    container.className = "popup_container";
    var head = document.createElement("img");
    head.src = image;
    head.className = "popup_img"
    container.appendChild(head);
    this.options = options;
    var body = document.createElement("div");
    body.className = "popup_table";
    this.selected = 0;
    this.rows = [];
    for (var i = 0; i < options.length; i ++){
        var tr = document.createElement("div");
        tr.className = "popup_row " + (i == this.selected?"active":"inactive");
        var sign = document.createElement("div");
        sign.className = "popup_sign";
        tr.appendChild(sign);
        var text = document.createElement("div");
        text.className = "popup_text";
        text.innerHTML = options[i].text;
        tr.appendChild(text);
        body.appendChild(tr);
        this.rows.push(tr);
    }
    container.appendChild(body);
    this.element = container;
    this.getSelected = function(){
        return this.selected;
    }
    this.setSelected = function(num){
        num %= this.options.length;
        num += this.options.length;
        num %= this.options.length;
        this.rows[this.selected].className = "popup_row inactive";
        this.rows[num].className = "popup_row active";
        this.selected = num;
    }
    this.act = function (){
        this.options[this.selected].callback();
        this.manager.remove();
    }
    this.manager = undefined;
}
function PopUpManager(container){
    function randomString(length) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

        if (! length) {
            length = Math.floor(Math.random() * chars.length);
        }

        var str = '';
        for (var i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
    this.top = 0;
    this.idtext = randomString(6);
    this.stack = [];
    this.popUp = function(popup){
        popup.element.id = this.idtext + this.top;
        //console.log(popup);
        this.stack[this.top] = popup;
        console.log(this.stack);
        this.top ++;
        popup.manager = this;
        container.appendChild(popup.element);
    }
    this.remove = function(){
        this.top --;
        var child = this.stack[this.top].element;
        child.parentNode.removeChild(child);
    }
    this.getPopUp = function(){
        return this.stack[this.top - 1];
    }

}