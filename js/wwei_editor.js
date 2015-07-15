var wwei_editor = null; // 百度编辑框的id
var append = null; //要插入地方的id 
var showBtn = null; // 点击显示的按钮
var url = null; // ajax请求地址
var tempUrl = null; // 不需要设置
function initEditor(wx_editor,appendArea,showEdi,ajaxUrl){//
    wwei_editor = UE.getEditor(wx_editor);
    append = appendArea;
    showBtn = showEdi;
    url = tempUrl = ajaxUrl;
    $("#"+showBtn).click(function(){
		$(".span5").css("display","block");
		$(this).hide();
	});

    $("<div class='span5'><ul class='nav' id='templateTab'><li class='active'><a href='#temp-title' data-type='title'>标题</a></li><li><a href='#temp-text' data-type='text'>正文</a></li><li><a href='#temp-img' data-type='img'>图片</a></li><li><a href='#temp-follow' data-type='follow'>吸粉</a></li><li><a href='#temp-scene' data-type='scene'>场景</a></li><li><a href='#temp-tpl' data-type='tpl'>模板</a></li></ul><div class='template-content' id='tab_pane'><div class='active' id='temp-title'></div><div id='temp-text'></div><div id='temp-img'></div><div id='temp-follow'></div><div id='temp-scene'></div><div id='temp-tpl'></div></div></div> ")
    .appendTo("#"+append);

	tempLoad();

}


function getSelectionHtml() {
    var range = wwei_editor.selection.getRange();
    range.select();
    var selectionObj = wwei_editor.selection.getNative();
    var rangeObj = selectionObj.getRangeAt(0);
    var docFragment = rangeObj.cloneContents();
    var testDiv = document.createElement("div");
    testDiv.appendChild(docFragment);
    var selectHtml = testDiv.innerHTML;
    return selectHtml;
}

function insertHtml(html) {
	var select_html = getSelectionHtml();
	if (select_html != "") {
		select_html = strip_tags(select_html, '<br><p><h1><h2><h3><h4><h5><h6><img>');
		var select_obj = $('<div>' + select_html + '</div>');
		var obj = $('<div>' + html + '</div>');
		select_obj.find('img').each(function(i) {
			var img = obj.find('img').eq(i);
			if (img && img.size() > 0) {
				img.attr('src', $(this).attr('src'));
				$(this).remove();
			}
		});
		var brushs = obj.find('.wweibrush');
		var total = brushs.size();
		if (total > 0) {
			if (total == 1) {
				var brush_item = obj.find('.wweibrush:first');
				if (brush_item.data('brushtype') == 'text') {
					brush_item.html($.trim(select_obj.text()));
				} else {
					select_obj.contents().each(function(i) {
						var $this = this;
						if (this.tagName == "IMG") {
							return;
						};
						if ($.trim($($this).text()) == "" || this.tagName == 'BR' || $(this).html() == "" || $(this).html() == "&nbsp;" || $(this).html() == "<br>" || $(this).html() == "<br/>") {
							$(this).remove();
						}
					});
					var style = brush_item.data('style');
					if (style) {
						select_obj.find('*').each(function() {
							$(this).attr('style', style);
						});
					}
					brush_item.html(select_obj.html());
				}
			} else {
				select_obj.contents().each(function(i) {
					var $this = this;
					if (this.tagName == "IMG") {
						return;
					};
					if ($.trim($($this).text()) == "" || this.tagName == 'BR' || $(this).html() == "" || $(this).html() == "&nbsp;" || $(this).html() == "<br>" || $(this).html() == "<br/>") {
						$(this).remove();
					}
				});
				select_obj.contents().each(function(i) {
					var $this = this;
					if ($this.nodeType == 3) {
						$this = $('<p>' + $(this).text() + '</p>').get(0);
					}
					if (i < total) {
						var brush_item = brushs.eq(i);
						if (brush_item.data('brushtype') == 'text') {
							brush_item.html($.trim($($this).text()));
						} else {
							var style = brush_item.data('style');
							if (style) {
								$($this).attr('style', style);
							}
							brush_item.empty().append($($this));
						}
					} else {
						var brush_item = brushs.eq(total - 1);
						if (brush_item.data('brushtype') == 'text') {
							brush_item.append($($this).text());
						} else {
							var style = brush_item.data('style');
							if (style) {
								$($this).attr('style', style);
							}
							brush_item.append($($this));
						}
					}
				});
			}
			obj.find('p').each(function(i) {
				if ($(this).html() == "" || $(this).html() == "&nbsp;" || $(this).html() == "<br>" || $(this).html() == "<br/>") {
					if (typeof $(this).attr('style') == 'undefined') {
						$(this).remove();
					}
				}
			});
		}
		html = obj.html();
		wwei_editor.execCommand('insertHtml', html);
		wwei_editor.undoManger.save();
		return true;
	} else {}

    wwei_editor.execCommand('insertHtml', html);
    wwei_editor.undoManger.save();
    return true;
}


///////////////////////////////////////////////////////////////////

function tempLoad() {
	var data_type = 'title';
    function _loadtemp(data_type){
        $("#template-loading").show(data_type);
        // console.log(data_type);
        $.ajax({
            type: "POST",
            url: url+"temp_"+data_type+".html",
            dataType : "jsonp",
            jsonp: "callback",
            // data: {"data_Type":data_type,"url":tempUrl},
			jsonpCallback:"success_jsonpCallback",
            success: function(json){
            	// console.log(json);
                $("#template-loading").hide();
                var tabPane = $("#temp-"+data_type);
                tabPane.html(json);
                var _tempLi = tabPane.find('.template-list li');
                _tempLi.hover(function(){
                    $(this).css({"background-color":"#f5f5f5"});
                },function(){
                    $(this).css({"background-color":"#fff"});
                });
                _tempLi.click(function(){
                    if(data_type=='tpl'){
                        var _tempHtml = $(this).find('.tpl-code').html();
                        wwei_editor.setContent("");
                        wwei_editor.execCommand('insertHtml', _tempHtml);
                    }else{
                        var _tempHtml = $(this).html();
                        insertHtml(_tempHtml + "<p><br/></p>");
                    }
                    
                });
            }
        });
    }
    _loadtemp(data_type);//加载
    //TAB切换
    // $('#templateTab a').click(function (e) {
    //     e.preventDefault();
    //     $(this).tab('show');
        
    //     data_type = $(this).attr("data-type");
    //     if(data_type){
    //         var tabPane = $("#temp-"+data_type);
    //         if(tabPane.find('.template-list').length<=0){
    //         	// url= tempUrl + "temp_"  +  data_type + ".html"
    //             _loadtemp(data_type);
    //         }
    //     }
    // });

    var aElem = $("#templateTab li");
    // console.log(aElem);
    aElem.each(function(){
    	$(this).click(function(e){
    		e.preventDefault();
    		aElem.removeClass('active');
    		$(this).addClass('active');

    		data_type = $(this).find('a').attr("data-type");
    		if (data_type) {
    			var tabPane = $("#temp-"+data_type);
				$("#tab_pane div").removeClass("active");
    			tabPane.addClass("active");
				if(tabPane.find('.template-list').length<=0){
	            	_loadtemp(data_type);
		        }
		        $("#tab_pane div").removeClass("active");
    			tabPane.addClass("active");
			}

    	});
    });
}