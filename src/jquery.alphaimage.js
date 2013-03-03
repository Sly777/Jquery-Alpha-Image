/*
 Jquery - Alpha Image
 Version 1.0.0 (03.03.2013)

 Author : Ilker Guller (http://ilkerguller.com)

 Description: This plugin can change selected colours to transparent and give result as image or imagedata. This plugin works IE9+, Chrome, Firefox, Safari.
 Details: https://github.com/Sly777/Jquery-Alpha-Image
 */

(function($){

    var defOptions = {
        colour: "",
        onlyData: false,
        canvasId: "cnvsAlphaImage",
        onComplete: function (){}
    };

    $.alphaimage = function(el, options){
        var base = this;
        base.$el = $(el);
        base.el = el;

        var _tmpImage = new Image(),
            _tmpData;

        var getImageInfo = function (){
            base.imageWidth = base.$el.css("width").toLowerCase();
            base.imageHeight = base.$el.css("height").toLowerCase();
            base.imageURL = base.$el.attr("src");

            if (base.imageWidth === "" || base.imageHeight === "" || base.imageURL === "") {
                console.log("Problem! Plugin cannot get image info...");
                return false;
            }

            if (base.imageWidth.indexOf("px") !== -1) base.imageWidth = base.imageWidth.replace("px", "");
            if (base.imageHeight.indexOf("px") !== -1) base.imageHeight = base.imageHeight.replace("px", "");

            return true;
        };

        var getColours = function (){
            if (base.options.colour === "") {
                console.log("Problem! Colour value is null...");
                return false;
            }

            var result;

            if (base.options.colour.indexOf("#") === -1) {
                result = getRGBfromText(base.options.colour);
            } else {
                result = getRGBfromHEX(base.options.colour);
            }

            if (result === null) {
                console.log("Problem! Colour value is null...");
                return false;
            } else {
                base.imageColour = result;
            }

            return true;
        };

        var getRGBfromHEX = function (hex){
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        var getRGBfromText = function (text){
            var cArr = text.split(",");
            return (cArr.length === 3) ? {
                r: parseInt(cArr[0]),
                g: parseInt(cArr[1]),
                b: parseInt(cArr[2])
            } : null;
        };

        var createTempCanvas = function (){
            base.$canvas = $('<canvas id="' + base.options.canvasId + '" width="' + base.imageWidth + '" height="' + base.imageHeight + '" style="visibility: hidden;"></canvas>');
            base.$canvas.appendTo("body");
            base.ctx = base.$canvas[0].getContext("2d");
        };

        var adjustImage = function (_data, _red, _green, _blue){
            var imageData = _data.data;
            for (var i = 0; i < imageData.length; i+= 4) {
                if(imageData[i] === _red && imageData[i+1] === _green && imageData[i+2] === _blue){
                    imageData[i+3] = 1;
                }
            }

            _data.data = imageData;
            return _data;
        };

        var lastWorks = function (){
            var _imgSrc = base.$canvas[0].toDataURL('image/png');

            var _img = new Image();
            _img.src = _imgSrc;

            return {
                imageSrc: _imgSrc,
                image: _img
            };
        };

        _tmpImage.onerror = function() {
            console.log("Problem! Plugin didn't download image...");
            return false;
        };

        _tmpImage.onload = function (){
            base.ctx.drawImage(_tmpImage, 0, 0);
            _tmpData = base.ctx.getImageData(0, 0, base.imageWidth, base.imageHeight);

            base.ctx.putImageData(adjustImage(_tmpData, base.imageColour.r, base.imageColour.g, base.imageColour.b), 0, 0);

            var result = lastWorks();
            base.$canvas.remove();

            if (base.options.onlyData) {
                if (typeof base.options.onComplete !== "function") {
                    console.log("Problem! Plugin cannot find onComplete Event...");
                    return false;
                }
                base.options.onComplete(result);
            } else {
                base.$el.attr("src", result.imageSrc);
            }

        };

        base.init = function (){
            base.options = $.extend({}, $.alphaimage.defaultOptions, options);

            getImageInfo();
            getColours();
            createTempCanvas();
            _tmpImage.src = base.imageURL;
        };

        base.init();
    };

    $.alphaimage.defaultOptions = defOptions;

    $.fn.alphaimage = function(options){
        return this.each(function(){
            (new $.alphaimage(this, options));
        });
    };

})(jQuery);