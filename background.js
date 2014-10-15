(function() {
  var __slice = [].slice;

  window.debug = function(msg) {
    return console.log(msg);
  };

  window.Base = {
    module: function(name, block) {
      var item, target, top, _i, _len, _ref;
      top = window['Base'];
      target = window['Base'];
      _ref = name.split('.');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        target = target[item] || (target[item] = {});
      }
      return block(target, top);
    },
    debounce: function(threshold, execAsap, func) {
      var debounced, timeout;
      timeout = null;
      return debounced = function() {
        var args, delayed,
          _this = this;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        delayed = function() {
          if (!execAsap) {
            func.apply(_this, args);
          }
          return timeout = null;
        };
        if (timeout) {
          clearTimeout(timeout);
        } else if (execAsap) {
          func.apply(this, args);
        }
        return timeout = setTimeout(delayed, threshold);
      };
    }
  };

}).call(this);

(function() {
  Base.module('Background.Chrome.BaseApi', function(BaseApi, Base) {
    var contactUrl, createCompany, createLeadTags, createPerson, createSimpleCompany, createSuggestion, getAjax, jsonCompany, jsonLead, jsonPerson, jsonSimpleCompany, jsonSocial, leadUrl, postAjax, retryPostAjax;
    BaseApi.authenticate = function(options) {
      var data, storage;
      storage = Base.Background.Chrome.Storage;
      data = {
        email: options.email,
        password: options.password
      };
      return $.ajax({
        url: 'https://core.futuresimple.com/api/v1/authentications.json',
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function(result) {
          var accountName, apiToken;
          apiToken = result.authentication.token;
          accountName = result.authentication.account.name;
          storage.setApiToken(apiToken);
          storage.setAccountName(accountName);
          return options.success(apiToken);
        },
        error: function(result) {
          return options.error(result);
        }
      });
    };
    BaseApi.createContact = function(options) {
      if (options.profile.lastName && options.profile.companyName) {
        return createSimpleCompany(options, function(contactId) {
          return createPerson(options, contactId);
        });
      } else if (options.profile.lastName) {
        return createPerson(options, null);
      } else if (options.profile.companyName) {
        return createCompany(options);
      }
    };
    BaseApi.createLead = function(options) {
      return postAjax({
        url: 'https://leads.futuresimple.com/api/v1/leads.json',
        data: {
          lead: jsonLead(options.profile)
        },
        authHeader: 'X-Futuresimple-Token',
        error: options.error,
        success: function(result) {
          return createLeadTags({
            leadId: result.lead.id,
            tags: options.profile.tags,
            error: options.error,
            success: function(resp) {
              return options.success({
                kind: 'Lead',
                url: leadUrl(result.lead.id)
              });
            }
          });
        }
      });
    };
    BaseApi.postFeatureUsage = function() {
      return $.ajax({
        url: 'https://overmind.futuresimple.com/api/usage/update.json',
        data: {
          feature_name: 'chrome_contact_clipper',
          account_name: Base.Background.Chrome.Storage.getAccountName()
        },
        type: 'POST',
        dataType: 'json'
      });
    };
    BaseApi.search = function(query, callback) {
      var cacheBust;
      cacheBust = new Date().getTime();
      return getAjax({
        url: 'https://app.futuresimple.com/apis/search/api/v1/search.json',
        data: {
          q: query,
          _: cacheBust
        },
        authHeader: 'X-Futuresimple-Token',
        success: function(response) {
          var result, results, _i, _len;
          results = [];
          for (_i = 0, _len = response.length; _i < _len; _i++) {
            result = response[_i];
            if (result = createSuggestion(result)) {
              results.push(result);
            }
          }
          return callback(results);
        },
        error: function(response) {
          return callback([]);
        }
      });
    };
    leadUrl = function(id) {
      return "https://app.futuresimple.com/leads/" + id;
    };
    contactUrl = function(id) {
      return "https://app.futuresimple.com/crm/contacts/" + id;
    };
    createSuggestion = function(result) {
      var contact, deal, description, lead, name, url;
      if (result.type === 'contact') {
        contact = result.data;
        name = contact.is_organisation ? contact['first_name.sortable'] : $.trim("" + ($.trim(contact.first_name)) + " " + ($.trim(contact.last_name)));
        description = "[Contact] " + name;
        url = "https://app.futuresimple.com/crm/contacts/" + contact.id;
        return {
          content: url,
          description: description
        };
      } else if (result.type === 'deal') {
        deal = result.data;
        name = $.trim(deal.name);
        description = "[Deal] " + name;
        url = "https://app.futuresimple.com/sales/deals/" + deal.id;
        return {
          content: url,
          description: description
        };
      } else if (result.type === 'lead') {
        lead = result.data;
        name = $.trim("" + ($.trim(lead.first_name)) + " " + ($.trim(lead.last_name))) || $.trim(lead.company_name);
        description = "[Lead] " + name;
        url = "https://app.futuresimple.com/leads/" + lead.id;
        return {
          content: url,
          description: description
        };
      }
    };
    createCompany = function(options) {
      return postAjax({
        url: 'https://crm.futuresimple.com/api/v1/contacts/merge_or_create.json',
        authHeader: 'X-Pipejump-Auth',
        data: {
          contact: jsonCompany(options.profile)
        },
        success: function(result) {
          return options.success({
            kind: 'Contact',
            url: contactUrl(result.contact.id)
          });
        },
        error: options.error
      });
    };
    createSimpleCompany = function(options, successCallback) {
      return postAjax({
        url: 'https://crm.futuresimple.com/api/v1/contacts/merge_or_create.json',
        authHeader: 'X-Pipejump-Auth',
        data: {
          contact: jsonSimpleCompany(options.profile)
        },
        success: function(result) {
          return successCallback(result.contact.id);
        },
        error: options.error
      });
    };
    createPerson = function(options, contactId) {
      return postAjax({
        url: 'https://crm.futuresimple.com/api/v1/contacts.json',
        authHeader: 'X-Pipejump-Auth',
        data: {
          contact: jsonPerson(options.profile, contactId)
        },
        success: function(result) {
          return options.success({
            kind: 'Contact',
            url: contactUrl(result.contact.id)
          });
        },
        error: options.error
      });
    };
    retryPostAjax = function(maxRetries, options) {
      var tryAjax;
      tryAjax = function(numberOfRetries) {
        var data;
        data = $.extend({}, options, {
          error: function(jqXHR) {
            if (jqXHR.status === 502 && numberOfRetries < maxRetries) {
              debug("Retrying tags");
              return tryAjax(numberOfRetries + 1);
            } else {
              return options.error;
            }
          }
        });
        return postAjax(data);
      };
      return tryAjax(0);
    };
    createLeadTags = function(options) {
      return retryPostAjax(3, {
        url: 'https://app.futuresimple.com/apis/tags/api/v1/taggings.json',
        data: {
          app_id: 5,
          taggable_type: 'Lead',
          taggable_id: options.leadId,
          tag_list: options.tags.join(', ')
        },
        authHeader: 'X-Futuresimple-Token',
        success: options.success,
        error: options.error
      });
    };
    postAjax = function(options) {
      var apiToken;
      apiToken = Base.Background.Chrome.Storage.getApiToken();
      return $.ajax({
        url: options.url,
        type: 'POST',
        data: options.data,
        dataType: 'json',
        beforeSend: function(req) {
          return req.setRequestHeader(options.authHeader, apiToken);
        },
        success: options.success,
        error: options.error
      });
    };
    getAjax = function(options) {
      var apiToken;
      apiToken = Base.Background.Chrome.Storage.getApiToken();
      return $.ajax({
        url: options.url,
        type: 'GET',
        data: options.data,
        dataType: 'json',
        beforeSend: function(req) {
          return req.setRequestHeader(options.authHeader, apiToken);
        },
        success: options.success,
        error: options.error
      });
    };
    jsonSocial = function(profile) {
      return {
        email: profile.email,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        skype: profile.skype,
        phone: profile.phone,
        mobile: profile.mobile,
        website: profile.website,
        description: profile.description
      };
    };
    jsonLead = function(profile) {
      return $.extend({}, jsonSocial(profile), {
        first_name: profile.firstName,
        last_name: profile.lastName,
        company_name: profile.companyName,
        title: profile.title,
        industry: profile.industry,
        street: profile.addressStreet,
        city: profile.addressCity,
        region: profile.addressRegion,
        zip: profile.addressZip,
        country: profile.addressCountry
      });
    };
    jsonCompany = function(profile) {
      return $.extend({}, jsonSocial(profile), {
        is_organisation: true,
        name: profile.companyName,
        industry: profile.industry,
        contact_id: null,
        address: profile.addressStreet,
        city: profile.addressCity,
        region: profile.addressRegion,
        zip: profile.addressZip,
        country: profile.addressCountry,
        tag_list: profile.tags.join(', ')
      });
    };
    jsonSimpleCompany = function(profile) {
      return {
        is_organisation: true,
        name: profile.companyName,
        contact_id: null
      };
    };
    return jsonPerson = function(profile, contactId) {
      return $.extend({}, jsonSocial(profile), {
        is_organisation: false,
        first_name: profile.firstName,
        last_name: profile.lastName,
        title: profile.title,
        industry: profile.industry,
        contact_id: contactId,
        address: profile.addressStreet,
        city: profile.addressCity,
        region: profile.addressRegion,
        zip: profile.addressZip,
        country: profile.addressCountry,
        tag_list: profile.tags.join(', ')
      });
    };
  });

}).call(this);

(function() {
  Base.module('Background.Chrome.Omnibox', function(Omnibox, Base) {
    var baseApi, search, throttleSearchTime;
    baseApi = Base.Background.Chrome.BaseApi;
    throttleSearchTime = 200;
    search = Base.debounce(throttleSearchTime, false, function(text, suggest) {
      return baseApi.search(text, function(suggestions) {
        chrome.omnibox.setDefaultSuggestion({
          description: 'Open Dashboard'
        });
        return suggest(suggestions);
      });
    });
    Omnibox.search = function(text, suggest) {
      text = $.trim(text);
      if (text.length < 2) {
        return;
      }
      return search(text, suggest);
    };
    return Omnibox.goToUrl = function(url) {
      if (url.indexOf("http") !== 0) {
        url = 'https://app.futuresimple.com/';
      }
      return chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var options, tab;
        tab = tabs[0];
        options = {
          url: url,
          selected: true
        };
        if (tab.url === 'chrome://newtab/') {
          return chrome.tabs.update(tab.id, options);
        } else {
          return chrome.tabs.create(options);
        }
      });
    };
  });

}).call(this);

(function() {
  Base.module('Background.Chrome.PageIcon', function(PageIcon, Base) {
    var changeIcon, icons, setTitle;
    PageIcon.setAvailable = function(tabId) {
      changeIcon(tabId, icons.available);
      return setTitle(tabId, 'Clip to Base CRM');
    };
    PageIcon.setClipped = function(tabId) {
      changeIcon(tabId, icons.clipped);
      return setTitle(tabId, 'Saved to Base CRM');
    };
    icons = {
      available: {
        '19': '/img/add-19.png',
        '38': '/img/add-38.png'
      },
      clipped: {
        '19': '/img/success-19.png',
        '38': '/img/success-38.png'
      }
    };
    changeIcon = function(tabId, img) {
      return chrome.pageAction.setIcon({
        tabId: tabId,
        path: img
      });
    };
    return setTitle = function(tabId, message) {
      return chrome.pageAction.setTitle({
        tabId: tabId,
        title: message
      });
    };
  });

}).call(this);

(function() {
  Base.module('Background.Chrome.Storage', function(Storage, Base) {
    var findOldProfile, getItem, localStorage, popupTabIdsKey, setItem;
    Storage.clear = function() {
      return localStorage.clear();
    };
    Storage.set = function(key, val) {
      val = JSON.stringify(val);
      debug("Storing '" + key + "' => '" + val + "'");
      return setItem(key, val);
    };
    Storage.get = function(key) {
      var val;
      val = JSON.parse(getItem(key));
      debug("Fetching '" + key + "' => '" + (JSON.stringify(val)) + "'");
      return val;
    };
    Storage["delete"] = function(key) {
      debug("Deleting '" + key + "'");
      return localStorage.removeItem(key);
    };
    Storage.setString = function(key, val) {
      debug("Storing '" + key + "' => '" + val + "'");
      return setItem(key, val);
    };
    Storage.getString = function(key) {
      var val;
      val = getItem(key);
      debug("Fetching '" + key + "' => '" + val + "'");
      return val;
    };
    Storage.isClipAsLead = function() {
      var clip;
      clip = Storage.getString('clipas') || 'lead';
      return clip === 'lead';
    };
    Storage.isContactClipped = function(contact) {
      var oldProfile;
      if (!contact) {
        return false;
      }
      if (Storage.get(contact.profileId) != null) {
        return true;
      }
      if (oldProfile = findOldProfile(contact)) {
        Storage.setContactClipped(contact);
        Storage["delete"](oldProfile);
        return true;
      } else {
        return false;
      }
    };
    Storage.setContactClipped = function(contact) {
      return Storage.set(contact.profileId, true);
    };
    Storage.getApiToken = function() {
      return Storage.getString('api_token');
    };
    Storage.setApiToken = function(apiToken) {
      return Storage.setString('api_token', apiToken);
    };
    Storage.getAccountName = function() {
      return Storage.getString('account_name');
    };
    Storage.setAccountName = function(name) {
      return Storage.setString('account_name', name);
    };
    Storage.allPopupTabs = function() {
      return Storage.get(popupTabIdsKey) || [];
    };
    Storage.addPopupTab = function(tabId) {
      var tabs;
      tabs = Storage.allPopupTabs();
      tabs.push(tabId);
      return Storage.set(popupTabIdsKey, $.unique(tabs));
    };
    Storage.clearPopupTabs = function() {
      return Storage.set(popupTabIdsKey, null);
    };
    Storage.sanitizeDatabase = function() {
      var key, val, _results;
      _results = [];
      for (key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) {
          continue;
        }
        val = getItem(key);
        debug("Sanitizing " + key + " => " + val);
        delete localStorage[key];
        key = key.split(/\s+/).join(' ');
        _results.push(setItem(key, val));
      }
      return _results;
    };
    localStorage = window.localStorage;
    getItem = function(key) {
      return localStorage.getItem(key);
    };
    setItem = function(key, val) {
      return localStorage.setItem(key, val);
    };
    popupTabIdsKey = 'popupTabIds';
    return findOldProfile = function(contact) {
      var facebook, linkedin, name;
      name = contact.lastName ? $.trim("" + contact.firstName + " " + contact.lastName) : contact.companyName;
      linkedin = "linkedin/" + name;
      if (Storage.get(linkedin) != null) {
        return linkedin;
      }
      facebook = "facebook/" + name;
      if (Storage.get(facebook) != null) {
        return facebook;
      }
      return null;
    };
  });

}).call(this);

(function() {
  var baseApi, getContactFromTab, pageIcon, saveContact, showAction, storage;

  debug('Loading background.js');

  storage = Base.Background.Chrome.Storage;

  pageIcon = Base.Background.Chrome.PageIcon;

  baseApi = Base.Background.Chrome.BaseApi;

  getContactFromTab = function(tabId, url, callback) {
    return chrome.tabs.sendMessage(tabId, {
      name: 'getContact',
      url: url
    }, function(response) {
      if (response) {
        return callback(response.contact, tabId);
      }
    });
  };

  showAction = function(contact, tabId) {
    if (!(contact && contact.profileId)) {
      return;
    }
    if (!storage.getApiToken()) {
      chrome.pageAction.setPopup({
        tabId: tabId,
        popup: 'sign_in.html'
      });
      storage.addPopupTab(tabId);
    }
    if (storage.isContactClipped(contact)) {
      pageIcon.setClipped(tabId);
      return chrome.pageAction.show(tabId);
    } else {
      pageIcon.setAvailable(tabId);
      return chrome.pageAction.show(tabId);
    }
  };

  saveContact = function(contact, tabId) {
    var error, success;
    chrome.tabs.sendMessage(tabId, {
      name: 'showOverlaySaving'
    });
    success = function(result) {
      storage.setContactClipped(contact);
      pageIcon.setClipped(tabId);
      chrome.tabs.sendMessage(tabId, {
        name: 'showOverlaySuccess',
        profile: result
      });
      return baseApi.postFeatureUsage();
    };
    error = function(result) {
      chrome.tabs.sendMessage(tabId, {
        name: 'showOverlayError'
      });
      return baseApi.postFeatureUsage();
    };
    if (storage.isClipAsLead()) {
      return baseApi.createLead({
        profile: contact,
        success: success,
        error: error
      });
    } else {
      return baseApi.createContact({
        profile: contact,
        success: success,
        error: error
      });
    }
  };

  chrome.pageAction.onClicked.addListener(function(tab) {
    return getContactFromTab(tab.id, tab.url, function(contact, tabId) {
      if (!(contact && !storage.isContactClipped(contact))) {
        return;
      }
      return saveContact(contact, tabId);
    });
  });

  chrome.webNavigation.onCompleted.addListener((function(details) {
    if (details.frameId !== 0) {
      return;
    }
    return getContactFromTab(details.tabId, details.url, showAction);
  }), {
    url: [
      {
        hostSuffix: 'linkedin.com'
      }
    ]
  });

  chrome.webNavigation.onCompleted.addListener((function(details) {
    return getContactFromTab(details.tabId, details.url, showAction);
  }), {
    url: [
      {
        hostSuffix: 'facebook.com'
      }
    ]
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 'login') {
      baseApi.authenticate({
        email: request.email,
        password: request.password,
        success: function(apiToken) {
          var tabId, _i, _len, _ref;
          _ref = storage.allPopupTabs();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tabId = _ref[_i];
            chrome.pageAction.setPopup({
              tabId: tabId,
              popup: ''
            });
          }
          storage.clearPopupTabs();
          return sendResponse({
            apiToken: apiToken
          });
        },
        error: function(data) {
          return sendResponse({
            statusCode: data.statusCode,
            message: data.message
          });
        }
      });
    }
    return true;
  });

  chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    return Base.Background.Chrome.Omnibox.search(text, suggest);
  });

  chrome.omnibox.onInputEntered.addListener(function(url, disposition) {
    return Base.Background.Chrome.Omnibox.goToUrl(url);
  });

  chrome.runtime.onInstalled.addListener(function(details) {
    var url;
    storage.sanitizeDatabase();
    url = (function() {
      switch (details.reason) {
        case 'install':
          return 'options.html';
        case 'update':
          return 'options.html?update=true';
        default:
          return 'options.html';
      }
    })();
    if (url) {
      return chrome.tabs.create({
        url: chrome.extension.getURL(url)
      });
    }
  });

}).call(this);
