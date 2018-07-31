/*
 *  MultiField (base on jQuery) 
 *  @author Mozfe
 *  @email mozshaw@foxmail.com
 */

(function($, window, undefined){
	"use strict";
	
	function MultiField(options, el) {
		this.el = el;
		this.options = this.customize(options);
		this.init(options);
	}
	
	MultiField.prototype.customize = function(custom) {
		// TODO expand
		var config = {
			width : 220,
			height : 25,
			resultHeight : 140,
			wrapCls : '',
			placeholder : '',
			msec : 500,
			limit : 5,
			repeatable : false,
			enableEmpty : false,
			require : true,
			validator : null,
			autoComplete : null,
			regex : {
				empty : /\S/g,
				ipv4 : '',
				ipv6 : '',
				ipv4ipv6 : ''
			},
			message : {
				common : '输入有误',
				limit : '最多添加{$}条记录',
				repeat : '该值已经存在',
				empty : '值不能为空',
				ipv4 : '请输入正确的IPv4地址',
				ipv6 : '',
				ipv4ipv6 : ''
			}
		}
		
		return $.extend(config, custom);
	}
	
	MultiField.prototype.WH = function() {
		var w = parseInt(this.options.width) + 'px',
			h = parseInt(this.options.height) + 'px',
			ww = parseInt(this.options.width) + 80 + 'px',
			rh = parseInt(this.options.resultHeight) + 'px';
		
		return {width : w, height : h, wrapWidth : ww, resultHeight : rh};
	}
	
	MultiField.prototype.init = function(options) {
		var tpl = [], 
			options = this.options,
			prev = $(this.el);
		
		tpl.push("<div class='mf-box " + options.wrapCls + "' style='width:" + this.WH().wrapWidth + "'>");
		tpl.push("<div class='mf-results' style='max-height:" + this.WH().resultHeight +"'></div>");
		tpl.push("<div class='mf-workspace'>");
		tpl.push("<input type='text' class='mf-input' style='width:" + this.WH().width + 
				";height:" + this.WH().height + "' spellcheck='false' placeholder='" + options.placeholder + "'/>");
		tpl.push("<div class='mf-button-add'></div>");
		tpl.push("<div class='mf-qtip-img mf-qtip-warn'></div>");
		tpl.push("</div>");
		tpl.push("</div>");
		prev.hide();
		prev.after(tpl.join(''));
		
		this.value = [];
		this.size = 0;
		this.wrapper = prev.next('.mf-box');
		this.inputEl = this.wrapper.find('.mf-input');
		this.addEl = this.wrapper.find('.mf-button-add');
		this.workEl = this.wrapper.find('.mf-workspace');
		this.resultEl = this.wrapper.find('.mf-results');
		
		this.setEvents();
	}
	
	MultiField.prototype.setEvents = function() {
		var me = this;
		
		this.addEl.on('click', function(ev) {
			me.add();
		});
		
		this.inputEl.on('keyup', function(ev) {
			var el = $(this),
				val = el.val();
			
			if (ev.keyCode == 13) {
				me.add();
				return;
			}
			
			me.validText(val, el);
		});
	}
	
	MultiField.prototype.add = function() {
		var currVal = this.inputEl.val(),
			autocomp = this.options.autoComplete,
			tpl = [],
			row = null,
			me = this;
		
		// auto-complete
		if (autocomp && typeof autocomp == 'function') {
			currVal = autocomp.call(this, currVal);
			this.inputEl.val(currVal);
		}
		
		if (!this.validLimit() || 
			!this.validText(currVal, this.inputEl)) {
			return;
		}

		this.insert(currVal);
		this.scrollDown();
	}
	
	MultiField.prototype.insert = function(val) {
		var tpl = [],
			row = null,
			me = this;
		
		tpl.push("<div class='mf-row'>");
		tpl.push("<input type='text' class='mf-row-input' style='width:" + this.WH().width
				+ ";height:" + this.WH().height + "' spellcheck='false' value='", val, "'>");	
		tpl.push("<div class='mf-button-del'></div>");
		tpl.push("<div class='mf-qtip-img mf-qtip-error'></div>");
		tpl.push("</div>");
		
		row = $(tpl.join(''));
		row.hide().appendTo(this.resultEl)
			.data('value', val)
			.show(this.options.msec);
		this.reset();
		this.recompute();
		
		// Events
		row.on('mouseover', function() {
			row.find('.mf-row-input').addClass('mf-row-edit');
		});
		
		row.on('mouseout', function() {
			row.find('.mf-row-input').removeClass('mf-row-edit');
		});
		
		row.find('.mf-row-input').on('keyup', function() {
			var el = $(this), val = el.val(),
				old = el.parent().data('value');
			me.validText(val, el, old);
		});
		
		row.find('.mf-row-input').on('blur', function() {
			me.edit(row, $(this).val());
		});
		
		row.find('.mf-button-del').on('mouseover', function() {
			$(this).addClass('mf-button-del-hover');
		});
		
		row.find('.mf-button-del').on('mouseout', function() {
			$(this).removeClass('mf-button-del-hover');
		});
		
		row.find('.mf-button-del').on('click', function() {
			me.remove(row);
		});
	}
	
	MultiField.prototype.edit = function(row, newValue) {
		var oldValue = row.data('value'),
			autocomp = this.options.autoComplete,
			el = row.find('.mf-row-input');
		
		if (autocomp && typeof autocomp == 'function') {
			newValue = autocomp.call(this, newValue);
			el.val(newValue);
		}
		
		if (!this.validText(newValue, el, oldValue)) {
			return;
		}
		
		row.data('value', newValue);
		this.recompute();
	}
	
	MultiField.prototype.remove = function(row) {
		var me = this;
		row.hide(this.options.msec);
		window.setTimeout(function() {
			row.remove();
			me.recompute();
			me.validLimit();
		}, this.options.msec);
	}
	
	MultiField.prototype.removeAll = function() {
		this.resultEl.empty();
		this.recompute();
	}
	
	MultiField.prototype.recompute = function() {
		var val = [];
		this.resultEl.find('.mf-row').each(function(index, row) {
			val.push($(row).data('value'));
		});
		
		this.value = val;
		this.size = val.length;
	}
	
	// 规格校验
	MultiField.prototype.validLimit = function() {
		var el = this.inputEl,
			qimg = el.parent().find('.mf-qtip-img'),
			me = this,
			valid;
		
		if (this.size == this.options.limit) {
			valid = false;
			el.addClass('mf-warning');
			qimg.css('display', 'inline-block');
		} else {
			valid = true;
			el.removeClass('mf-warning');
			qimg.css('display', 'none');
		}
		
		if (!valid) {
			this.qtip('limit', qimg, function(msg) {
				return msg.replace(/\{\$\}/, me.options.limit);
			});
		}
		return valid;
	}
	
	// 文本校验
	MultiField.prototype.validText = function(value, el, old) {
		var vtor = this.options.validator,
			qimg = el.parent().find('.mf-qtip-img'),
			pool = this.getValue(),
			type = '',
			valid = true;
		
		// empty
		if (!this.options.enableEmpty) {
			if ($.trim(value) == '') {
				type = 'empty';
				valid = false;
			} else {
				valid = true;
			}
		}
		
		// repeat (duplicate)
		if (valid && !this.options.repeatable) {
			if ($.inArray(value, pool) > -1) {
				if (old && value == old) {
					valid = true;
				} else {
					type = 'repeat';
					valid = false;
				}
			} else {
				valid = true;
			}
		}
		
		// validator
		if (valid && vtor) {
			if (vtor in this.options.regex) {
				type = vtor;
				valid = this.options.regex[vtor].test(value);
			} else if (typeof vtor == 'function') {
				var temp = {};
				temp = vtor.call(this, value);
				type = temp.msg || 'common';
				valid = temp.valid;
			}
		}
		
		if (valid) {
			el.removeClass('mf-warning');
			qimg.css('display', 'none');
		} else {
			el.addClass('mf-warning');
			qimg.css('display', 'inline-block');
			this.qtip(type, qimg);
		}
		
		return valid;
	}
	
	MultiField.prototype.isValid = function() {
		var valid = true;
		if (this.options.require) {
			valid = !this.isEmpty();
		}
		return valid && this.resultEl.find('.mf-warning').length == 0;
	}
	
	MultiField.prototype.isEmpty = function() {
		return this.size == 0;
	}
	
	MultiField.prototype.reset = function() {
		var el = this.inputEl,
			qimg = el.parent().find('.mf-qtip-img');
		el.removeClass('mf-warning').val('');
		qimg.css('display', 'none');
	}
	
	MultiField.prototype.getValue = function() {
		return this.value;
	}
	
	MultiField.prototype.setValue = function(value) {
		if (!Array.isArray(value)) return;
		this.removeAll();
		for (var i = 0, len = value.length; i < len; i++) {
			this.insert(value[i].toString());
		}
	}
	
	MultiField.prototype.qtip = function(type, qimg, decorate) {
		var msg = this.options.message[type] 
			|| type || this.options.message.common;
		
		if (typeof decorate == 'function') {
			msg = decorate(msg);
		}
		
		qimg.prop('title', msg);
	}
	
	MultiField.prototype.scrollDown = function() {
		var el = this.resultEl, 
			top = el.prop('scrollHeight'),
			msec = this.options.msec;
		
		el.animate({scrollTop : top}, msec);
	}
	
	MultiField.prototype.scrollUp = function() {
		var el = this.resultEl, 
			top = 0;
		
		el.scrollTop(top);
	}
	
	MultiField.prototype.clear = function() {
		this.reset();
		this.removeAll();
	}
	
	$.fn.multifield = function(options) {
		var args = Array.prototype.slice.call(arguments, 1),
			ret = this;
		
		this.each(function() {
			var me = $(this),
				plugin = me.data('multifield'),
				isSet = Boolean(plugin);
			
			if (isSet) {
				if (typeof options == 'string') {
					try {
						ret = plugin[options].apply(plugin, args);
					} catch(err) {
						console.error(options + ' is not a defined function in MultiField!');
					}
				}
			} else {
				me.data('multifield', new MultiField(options, this))
			}
		});
		
		return ret;
	}
	
})(jQuery, window);