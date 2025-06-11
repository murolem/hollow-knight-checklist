/*! js-cookie v3.0.5 | MIT */
;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
    var current = global.Cookies;
    var exports = global.Cookies = factory();
    exports.noConflict = function () { global.Cookies = current; return exports; };
  })());
})(this, (function () { 'use strict';

  /* eslint-disable no-var */
  function assign (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      )
    }
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init (converter, defaultAttributes) {
    function set (name, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      name = encodeURIComponent(name)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie =
        name + '=' + converter.write(value, name) + stringifiedAttributes)
    }

    function get (name) {
      if (typeof document === 'undefined' || (arguments.length && !name)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');

        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);

          if (name === found) {
            break
          }
        } catch (e) {}
      }

      return name ? jar[name] : jar
    }

    return Object.create(
      {
        set,
        get,
        remove: function (name, attributes) {
          set(
            name,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }

  var api = init(defaultConverter, { path: '/' });
  /* eslint-enable no-var */

  return api;

}));

var checkboxes;

function init() {
	checkboxes = document.querySelectorAll("input[type='checkbox']");
	reloadProgress();
	countProgress();
	listenForProgress();
	updatePercentage();
	initCookieAlert();
	document.getElementsByTagName('body')[0].className = "js";
}

function reloadProgress() {
	var progress = Cookies.get('progress');

	if (progress && progress.length) {
		try {
			progress = JSON.parse(progress);
		} catch (err) {
			console.error("failed loading progress: failed to parse JSON. no progress will be loaded");
			return;
		}

		for (var id in progress) {
			if (progress[id] == 1) {
				var el = document.querySelector("input[data-key='" + id + "']");

				el.checked = true;
			}
		}
	}
}

function listenForProgress() {
	for (var i = checkboxes.length - 1; i >= 0; i--) {
		checkboxes[i].addEventListener('change', function (event) {
			var id = event.target.getAttribute('id');
			saveProgress();
			countProgress();
			updatePercentage();
		});
	}

	document.getElementById("uncheckAll").addEventListener('click', function (event) {
		event.preventDefault();

		for (var i = checkboxes.length - 1; i >= 0; i--) {
			checkboxes[i].checked = false;
		}

		saveProgress();
		countProgress();
		updatePercentage();
	});
}

function saveProgress() {
	var progress = {};

	for (var i = checkboxes.length - 1; i >= 0; i--) {
		var checked = checkboxes[i].checked;
		var id = checkboxes[i].getAttribute('data-key');

		if (checked == true) {
			checked = 1;
		} else {
			checked = 0;
		}

		progress[id] = checked;
	}

	Cookies.set('progress', progress, { expires: 20 * 365 });
}

function countProgress() {
	var a = checkboxes.length;

	for (var i = checkboxes.length - 1; i >= 0; i--) {
		var checked = checkboxes[i].checked;
		var id = checkboxes[i].getAttribute('data-key');

		if (checked == true) {
			a -= 1;
		}

		document.getElementById("amountRemaining").innerHTML = a;
	}

	if (a == 0) {
		document.getElementById("congrats").style["display"] = "inline";
	} else {
		document.getElementById("congrats").style["display"] = "";
	}

	if (a < checkboxes.length) {
		document.getElementById("uncheckAll").style["display"] = "inline";
	} else {
		document.getElementById("uncheckAll").style["display"] = "";
	}
}

function initCookieAlert() {
	var hiddenCookieAlert = Cookies.get('hideCookieAlert');

	if (!hiddenCookieAlert) {
		document.getElementById("hideCookieAlert").addEventListener('click', function (event) {
			event.preventDefault();
			Cookies.set('hideCookieAlert', true, { expires: 20 * 365 });
			document.getElementById("cookieAlert").style['display'] = 'none';
		});
	} else {
		document.getElementById("cookieAlert").style['display'] = 'none';
	}
}

function updatePercentage() {
	var percent = 0;
	for (var i = checkboxes.length - 1; i >= 0; i--) {
		if (checkboxes[i].checked) {
			percent += (checkboxes[i].getAttribute('data-percent') * 1);
		}
	}

	percent = (Math.round(percent * 100) / 100);
	percentElement = document.getElementById("percent");

	percentElement.innerHTML = percent + '% <small>done</small>';
	if (percent == 112) {
		percentElement.className = "complete";
	} else {
		percentElement.className = "";
	}
}

window.onload = init();