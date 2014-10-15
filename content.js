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
  Base.module('Content.Core.Scraper.FacebookCompany', function(FacebookCompany, Base) {
    var companyName, description, email, facebook, phone, profileId, tags, website;
    FacebookCompany.getProfile = function(html) {
      html = $(html);
      return {
        profileSource: 'facebook',
        profileType: 'company',
        profileId: profileId(html),
        companyName: companyName(html),
        phone: phone(html),
        email: email(html),
        website: website(html),
        facebook: facebook(html),
        description: description(html),
        tags: tags(html)
      };
    };
    profileId = function(el) {
      var data, err, id;
      data = el.find('#pagelet_timeline_main_column').attr('data-gt');
      try {
        id = $.parseJSON(data)['profile_owner'];
        if (!(id && id.match(/^\d+/))) {
          return null;
        }
        return "facebook/company-" + id;
      } catch (_error) {
        err = _error;
        return null;
      }
    };
    tags = function(el) {
      return ['contact clipper', 'facebook'];
    };
    companyName = function(el) {
      return $.trim(el.find('#fbProfileCover .nameButton').text());
    };
    phone = function(el) {
      var div;
      div = el.find(".contactInfoTable td:contains('Phone')");
      return $.trim(div.parent().find('td').last().text());
    };
    email = function(el) {
      var div, text;
      div = el.find(".contactInfoTable td:contains('Email')");
      text = $.trim(div.parent().find('td').last().text());
      if (text && text.match('@')) {
        return text;
      } else {
        return '';
      }
    };
    website = function(el) {
      var div, url;
      div = el.find(".contactInfoTable td:contains('Website')");
      url = $.trim(div.parent().find('td').last().text());
      if (url) {
        return url;
      }
      div = el.find(".profileInfoTable th:contains('Website')");
      return $.trim(div.parent().find('td a:first').text());
    };
    facebook = function(el) {
      var link, url;
      url = $.trim(el.find('a.profileThumb').attr('href'));
      link = document.createElement('a');
      link.href = url;
      return "" + link.protocol + "//" + link.hostname + link.pathname;
    };
    return description = function(el) {
      var text;
      text = el.find('#timelineNavContent .fbTimelineSummarySection .fbLongBlurb').text();
      return $.trim(text).replace(/\s+/g, ' ');
    };
  });

}).call(this);

(function() {
  Base.module('Content.Core.Scraper.FacebookPerson', function(FacebookPerson, Base) {
    var address, addressCity, addressCountry, company, facebook, firstName, fullName, lastName, mobile, profileId, skype, tags, title, website;
    FacebookPerson.getProfile = function(html) {
      html = $(html);
      return {
        profileSource: 'facebook',
        profileType: 'individual',
        profileId: profileId(html),
        firstName: firstName(html),
        lastName: lastName(html),
        companyName: company(html),
        facebook: facebook(html),
        mobile: mobile(html),
        website: website(html),
        skype: skype(html),
        title: title(html),
        addressCity: addressCity(html),
        addressCountry: addressCountry(html),
        tags: tags(html)
      };
    };
    profileId = function(el) {
      var data, err, id;
      data = el.find('#pagelet_timeline_main_column').attr('data-gt');
      try {
        id = $.parseJSON(data)['profile_owner'];
        if (!(id && id.match(/^\d+/))) {
          return null;
        }
        return "facebook/member-" + id;
      } catch (_error) {
        err = _error;
        return null;
      }
    };
    fullName = function(el) {
      return $.trim(el.find('#fbTimelineHeadline img.profilePic').attr('alt'));
    };
    firstName = function(el) {
      var names;
      names = fullName(el).split(/\s+/);
      if (names.length > 1) {
        return names[0];
      } else {
        return '';
      }
    };
    lastName = function(el) {
      var names;
      names = fullName(el).split(/\s+/);
      if (names.length > 1) {
        return $.trim(names.slice(1).join(' '));
      } else {
        return names[0] || '';
      }
    };
    facebook = function(el) {
      return el.find('#fbProfileCover h2 a').attr('href') || '';
    };
    mobile = function(el) {
      return $.trim(el.find('.profileInfoTable .contactInfoPhone:first').text());
    };
    addressCity = function(el) {
      return $.trim(address(el).split(',')[0]);
    };
    addressCountry = function(el) {
      return $.trim(address(el).split(',').slice(-1)[0]);
    };
    address = function(el) {
      var div;
      div = el.find('#current_city .aboutSubtitle');
      return $.trim(div.parent().find('a').text());
    };
    website = function(el) {
      var th;
      th = el.find(".profileInfoTable th:contains('Website')");
      return th.parent().find('td a').text();
    };
    skype = function(el) {
      var span, th;
      th = el.find(".profileInfoTable th:contains('Screen Name')");
      span = th.parent().find("td li span:contains('Skype')");
      if (span) {
        return span.parent().find('a').text();
      } else {
        return '';
      }
    };
    company = function(el) {
      return $.trim(el.find('.fbProfileExperience:first .experienceTitle').text());
    };
    title = function(el) {
      return $.trim(el.find('.fbProfileExperience:first .experienceBody span:first').text());
    };
    return tags = function(el) {
      return ['contact clipper', 'facebook'];
    };
  });

}).call(this);

(function() {
  Base.module('Content.Core.Scraper.LinkedInCompany', function(LinkedInCompany, Base) {
    var addressCity, addressCountry, addressRegion, addressStreet, addressZip, company, description, industry, linkedin, pathname, profileId, tags, website;
    LinkedInCompany.getProfile = function(html) {
      html = $(html);
      return {
        profileSource: 'linkedin',
        profileType: 'company',
        profileId: profileId(html),
        companyName: company(html),
        industry: industry(html),
        website: website(html),
        description: description(html),
        linkedin: linkedin(html),
        addressStreet: addressStreet(html),
        addressCity: addressCity(html),
        addressRegion: addressRegion(html),
        addressZip: addressZip(html),
        addressCountry: addressCountry(html),
        tags: tags(html)
      };
    };
    profileId = function(el) {
      var path, url;
      if (url = el.find('#nav-home a').attr('href')) {
        if (path = pathname(url).split(/\W/).filter(function(e) {
          return e;
        }).join('-')) {
          return "linkedin/" + path;
        }
      }
      return '';
    };
    tags = function(el) {
      return ['contact clipper', 'linkedin'];
    };
    company = function(el) {
      var match, text;
      if (text = el.find('.basic-info .about h3').text()) {
        if (match = text.match(/^About (.+)$/)) {
          return $.trim(match[1]);
        }
      }
      return '';
    };
    addressStreet = function(el) {
      return $.trim(el.find('.basic-info .street-address:first').text());
    };
    addressCity = function(el) {
      var text;
      text = el.find('.basic-info .locality:first').text();
      return $.trim(text.replace(/,/g, ' '));
    };
    addressRegion = function(el) {
      return $.trim(el.find('.basic-info .region:first').text());
    };
    addressZip = function(el) {
      return $.trim(el.find('.basic-info .postal-code:first').text());
    };
    addressCountry = function(el) {
      return $.trim(el.find('.basic-info .country-name:first').text());
    };
    industry = function(el) {
      return $.trim(el.find('.basic-info .industry:first p').text());
    };
    website = function(el) {
      return $.trim(el.find('.basic-info .website:first p').text());
    };
    description = function(el) {
      return $.trim(el.find('.basic-info .description:first p:first').text());
    };
    linkedin = function(el) {
      var path;
      path = el.find('.top-bar .header a:first').attr('href');
      path = pathname(path);
      return "http://www.linkedin.com" + path;
    };
    return pathname = function(url) {
      var a;
      a = window.document.createElement('a');
      a.href = url;
      return a.pathname;
    };
  });

}).call(this);

(function() {
  Base.module('Content.Core.Scraper.LinkedInPerson', function(LinkedInPerson, Base) {
    var addressCity, addressCountry, company, defaultLinkedIn, description, email, firstName, fullName, industry, lastName, linkedin, makeLinkedinUrl, matchPhone, mobile, newLinkedIn, newPhone, newTwitter, newWebsite, oldLinkedIn, oldPhone, oldTwitter, oldWebsite, profileId, skype, tags, title, twitter, website;
    LinkedInPerson.getProfile = function(html) {
      html = $(html);
      return {
        profileSource: 'linkedin',
        profileType: 'individual',
        profileId: profileId(html),
        firstName: firstName(html),
        lastName: lastName(html),
        email: email(html),
        mobile: mobile(html),
        website: website(html),
        linkedin: linkedin(html),
        twitter: twitter(html),
        skype: skype(html),
        industry: industry(html),
        companyName: company(html),
        title: title(html),
        description: description(html),
        addressCity: addressCity(html),
        addressCountry: addressCountry(html),
        tags: tags(html)
      };
    };
    profileId = function(el) {
      var id;
      id = el.find('.masthead').attr('id');
      if (!(id && id.match(/^member-\d+/))) {
        return null;
      }
      return "linkedin/" + id;
    };
    tags = function(el) {
      return ['contact clipper', 'linkedin'];
    };
    firstName = function(el) {
      var names;
      names = fullName(el).split(/\s+/);
      if (names.length > 1) {
        return names[0];
      } else {
        return '';
      }
    };
    lastName = function(el) {
      var names;
      names = fullName(el).split(/\s+/);
      if (names.length > 1) {
        return $.trim(names.slice(1).join(' '));
      } else {
        return names[0] || '';
      }
    };
    fullName = function(el) {
      var name;
      name = $.trim(el.find('.full-name').text());
      return name.replace(/\(.+\)/, '');
    };
    email = function(el) {
      var val;
      val = el.find('#email-view a[href^="mailto:"]').text() || el.find('.abook-email a').text();
      return $.trim(val);
    };
    mobile = function(el) {
      return newPhone(el) || oldPhone(el);
    };
    newPhone = function(el) {
      var text;
      text = el.find("#phone-view").find('li').first().text();
      return matchPhone(text);
    };
    oldPhone = function(el) {
      var text;
      text = el.find("li.abook-phone").first().text();
      return matchPhone(text);
    };
    matchPhone = function(text) {
      var match;
      match = text.match(/[\(\)\+\d\s-]+\d/);
      if (match) {
        return $.trim(match[0]);
      } else {
        return '';
      }
    };
    website = function(el) {
      return newWebsite(el) || oldWebsite(el) || '';
    };
    newWebsite = function(el) {
      var url;
      url = el.find('#website-view a').first().attr('href');
      if (url) {
        return unescape(url.slice(20)).split('&urlhash')[0];
      } else {
        return '';
      }
    };
    oldWebsite = function(el) {
      var url;
      url = el.find("a[name=overviewsite]").attr('href');
      if (url) {
        return unescape(url.slice(20).split('&urlhash')[0]);
      } else {
        return '';
      }
    };
    linkedin = function(el) {
      return newLinkedIn(el) || oldLinkedIn(el) || defaultLinkedIn(el) || '';
    };
    makeLinkedinUrl = function(url) {
      url = $.trim(url);
      if (!(url && url.match(/.*linkedin\.com.+/))) {
        return '';
      }
      if (url.match(/^\w+\.linkedin.com.+/)) {
        return "http://" + url;
      } else if (url.match(/^http.*linkedin.com.+/)) {
        return url;
      } else {
        return '';
      }
    };
    newLinkedIn = function(el) {
      return makeLinkedinUrl(el.find('.public-profile span:first').text());
    };
    oldLinkedIn = function(el) {
      return makeLinkedinUrl(el.find('.public-profile a').attr('href'));
    };
    defaultLinkedIn = function(el) {
      var match;
      if (match = $.trim(profileId(el)).match(/linkedin\/member-(\w+)/)) {
        return "http://www.linkedin.com/profile/view?id=" + match[1];
      } else {
        return '';
      }
    };
    twitter = function(el) {
      return newTwitter(el) || oldTwitter(el) || '';
    };
    newTwitter = function(el) {
      return el.find('#twitter-view a').text();
    };
    oldTwitter = function(el) {
      var iframe, match, url;
      iframe = el.find('iframe.twitter-follow-button');
      if (url = iframe && iframe.attr('src')) {
        if (match = url.match(/screen_name=(\w+)/)) {
          return match[1];
        }
      }
    };
    skype = function(el) {
      var text;
      text = '';
      el.find('#im-view li').each(function() {
        var match;
        if (match = $(this).text().match(/(.+)\([Ss]kype\)/)) {
          return text = $.trim(match[1]);
        }
      });
      return text;
    };
    addressCity = function(el) {
      var address;
      address = el.find('#location-container .locality a').text();
      return $.trim(address.split(',')[0]);
    };
    addressCountry = function(el) {
      var address, addresses;
      address = el.find('#location-container .locality a').text();
      addresses = address.split(',');
      if (addresses.length > 1) {
        return $.trim(addresses.slice(-1)[0]);
      } else {
        return '';
      }
    };
    industry = function(el) {
      return el.find('#location dd.industry').children().text() || '';
    };
    company = function(el) {
      return $.trim(el.find('#background-experience .section-item:first header h5').text());
    };
    title = function(el) {
      return $.trim(el.find('#background-experience .section-item:first header h4').text());
    };
    return description = function(el) {
      return $.trim(el.find('#background-experience .section-item:first p.description').text());
    };
  });

}).call(this);

(function() {
  Base.module('Content.Core.Overlay', function(Overlay, Base) {
    return Overlay.spriteError = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAAHfOtk4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkZDAxMGI0ZS05YTYyLTQ2ZjEtOWQ2MC1lZTUwZTIyZWZiM2QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTFBOTU5ODgyM0ExMTFFM0EzNkFGQTg0NkZGN0ExRDkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzVBMDY2RkMyMzZFMTFFM0EzNkFGQTg0NkZGN0ExRDkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZGQwMTBiNGUtOWE2Mi00NmYxLTlkNjAtZWU1MGUyMmVmYjNkIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmRkMDEwYjRlLTlhNjItNDZmMS05ZDYwLWVlNTBlMjJlZmIzZCIvPiA8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';
  });

}).call(this);

(function() {
  Base.module('Content.Core.Overlay', function(Overlay, Base) {
    return Overlay.spriteGoToLink = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZGNTVFNjNFMjk3ODExRTM4OTIzQzQwNDlEN0RERUQ3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZGNTVFNjNGMjk3ODExRTM4OTIzQzQwNDlEN0RERUQ3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NkY1NUU2M0MyOTc4MTFFMzg5MjNDNDA0OUQ3RERFRDciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NkY1NUU2M0QyOTc4MTFFMzg5MjNDNDA0OUQ3RERFRDciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7tvzt3AAAB0klEQVR42rRVvW7CMBC+OCH8RQgoiWDr0LlLeI6KGbEhMXbt0j5AXwGpG2LmNSqB+goVqoREKAOEgfDXO9eJTAiGDv2kT05i3+fz+e6iQQI6nY6FQxPZQNaRtpjykEPkANnvdrt+3FZLEGvj8Iq8ATW+kU8o+pYoiEImDjTZgr+hh2yjcEAvTJo4K7bf72E2m8HhcEiabglbDl065vM5F0jI8zxYr9eQzWaBMRZfcu+67tdoNPrQxAV8qmJGQpPJhD8bhgGO44BpmkkxvTXEbZ6IBUEAvu/DarWC3W4Xfd9ut1zctm3I5XKyCWk0DZEaR5jP57BYLEAVgul0ykXz+bw81WAiz64WC0FCMQ8JdUNKWr7zcrk8Maa40VFDFItFzgTYRtJxQliWxQ3pVsfjMWiaBpVKJX7MIzBRTr9ZjgbpdJo/00jG5B3PL12HarWqFCMtJmozQqlUOllFG9VqtWgzBYZMFHqETCYD5XKZ595ms4kEQ08vYECCfZGUEQqFAvdUUW7nmkVfx3IJsGzo5SHuKcWNkpvK7Qo8YoN457VMNYiid1ST8opUKsVJx6dR1XFQ7IWnmPSxLXWPoxy8EL+eZPuPDVbxC3CRzrW/gB8BBgCymKfWdCeEbgAAAABJRU5ErkJggg==';
  });

}).call(this);

(function() {
  Base.module('Content.Core.Overlay', function(Overlay, Base) {
    return Overlay.spriteSaving = 'data:image/gif;base64,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';
  });

}).call(this);

(function() {
  Base.module('Content.Core.Overlay', function(Overlay, Base) {
    return Overlay.spriteSuccess = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAAHfOtk4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkZDAxMGI0ZS05YTYyLTQ2ZjEtOWQ2MC1lZTUwZTIyZWZiM2QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTFBOTU5OEMyM0ExMTFFM0EzNkFGQTg0NkZGN0ExRDkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTFBOTU5OEIyM0ExMTFFM0EzNkFGQTg0NkZGN0ExRDkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZGQwMTBiNGUtOWE2Mi00NmYxLTlkNjAtZWU1MGUyMmVmYjNkIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmRkMDEwYjRlLTlhNjItNDZmMS05ZDYwLWVlNTBlMjJlZmIzZCIvPiA8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';
  });

}).call(this);

(function() {
  Base.module('Content.Core.Overlay', function(Overlay, Base) {
    var closeOverlay, cssClose, cssImage, cssOverlay, cssOverlayHide, cssOverlayShow, cssParagraph, cssTopIcon, findOverlay, generateOverlay, timeout;
    Overlay.uniqueId = 'chrome-base-contact-clipper-123456789042';
    Overlay.showSaving = function() {
      var overlay, text;
      findOverlay().remove();
      text = 'Saving to Base...';
      overlay = generateOverlay(Overlay.spriteSaving, text);
      $('body').append(overlay);
      return timeout(1, function() {
        return overlay.css(cssOverlayShow());
      });
    };
    Overlay.showSuccess = function(profile) {
      var clickEvent, hideOverlay, overlay, text;
      text = "" + profile.kind + " added to Base.";
      overlay = findOverlay();
      overlay.find('img:first').attr('src', Overlay.spriteSuccess);
      overlay.find('img:last').attr('src', Overlay.spriteGoToLink).css('display', 'block');
      overlay.find('p').html(text);
      hideOverlay = function() {
        overlay.off('click', clickEvent);
        timeout(1, function() {
          return overlay.css(cssOverlayHide());
        });
        return timeout(1500, closeOverlay);
      };
      clickEvent = function(e) {
        hideOverlay();
        if (e.ctrlKey || e.metaKey) {
          window.open(profile.url);
        } else {
          window.location.href = profile.url;
        }
        return false;
      };
      overlay.on('click', clickEvent);
      overlay.css({
        cursor: 'pointer'
      });
      return timeout(3000, (function() {
        return hideOverlay();
      }));
    };
    Overlay.showError = function() {
      var close, el, text;
      text = 'Error saving to Base.';
      close = $('<a>', {
        href: '#',
        text: '×',
        css: cssClose()
      });
      el = findOverlay();
      el.find('img:first').attr('src', Overlay.spriteError);
      el.find('p').html(text);
      el.append(close);
      return el.click(closeOverlay);
    };
    timeout = function(millis, callback) {
      return setTimeout(callback, millis);
    };
    findOverlay = function() {
      return $("#" + Overlay.uniqueId);
    };
    closeOverlay = function() {
      var el;
      el = findOverlay();
      return el.remove();
    };
    generateOverlay = function(imgPath, message) {
      var icon, img, overlay, text;
      img = $('<img>', {
        src: imgPath,
        css: cssImage()
      });
      text = $('<p>', {
        text: message,
        css: cssParagraph()
      });
      icon = $('<img>', {
        src: '',
        css: cssTopIcon()
      });
      overlay = $('<div>', {
        id: Overlay.uniqueId,
        css: cssOverlay()
      });
      return overlay.append(img).append(text).append(icon);
    };
    cssOverlay = function() {
      return {
        'position': 'fixed',
        'top': '0px',
        'right': '45px',
        'z-index': '2147483647',
        'padding': '12px 12px',
        'display': 'flex',
        'width': '266px',
        '-webkit-border-radius': '4px',
        'border-radius': '4px',
        'background': 'rgba(34, 34, 34, 0.9)',
        'background-image': 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))',
        '-webkit-box-shadow': 'inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.4)',
        'box-shadow': 'inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.4)',
        'opacity': '0',
        '-webkit-transition': 'all 500ms cubic-bezier(0.420, 0.000, 0.580, 1.000)',
        '-webkit-transition-timing-function': 'cubic-bezier(0.420, 0.000, 0.580, 1.000)'
      };
    };
    cssOverlayShow = function() {
      return {
        'opacity': '1',
        '-webkit-transform': 'translateY(50px)',
        'transform': 'translateY(50px)'
      };
    };
    cssOverlayHide = function() {
      return {
        'opacity': '0',
        '-webkit-transform': 'translateY(100px)',
        'transform': 'translateY(100px)'
      };
    };
    cssImage = function() {
      return {
        'width': '38px',
        'height': '38px'
      };
    };
    cssParagraph = function() {
      return {
        'margin': '0',
        'padding': '0 0 0 15px',
        'width': '200px',
        'text-align': 'center',
        'font-size': '18px',
        'line-height': '38px',
        'font-family': '"Proxima Nova", "ProximaNova", "Helvetica Neue", Helvetica, Arial, sans-serif',
        'color': '#eee',
        'text-shadow': '0 -1px rgba(0, 0, 0, 0.3)'
      };
    };
    cssTopIcon = function() {
      return {
        'width': '20px',
        'height': '20px',
        'position': 'absolute',
        'top': '5px',
        'right': '5px',
        'display': 'none'
      };
    };
    return cssClose = function() {
      return {
        'position': 'absolute',
        'top': '2px',
        'right': '6px',
        'text-decoration': 'none',
        'color': '#999',
        'text-shadow': '0 -1px rgba(0, 0, 0, 1.0)',
        'font-size': '18px'
      };
    };
  });

}).call(this);

(function() {
  Base.module('Content.Core.Scraper', function(Scraper, Base) {
    var checkContact;
    Scraper.getLinkedInContact = function() {
      var html;
      html = $('body');
      if (html.find('#top-card').length) {
        return checkContact(Base.Content.Core.Scraper.LinkedInPerson.getProfile(html));
      } else if (html.find('#activity-feed').length) {
        return checkContact(Base.Content.Core.Scraper.LinkedInCompany.getProfile(html));
      } else {
        return null;
      }
    };
    Scraper.getFacebookContact = function() {
      var friendsLink, html;
      html = $('html');
      if (!html.find('#pagelet_timeline_main_column').length) {
        return null;
      }
      friendsLink = html.find('#fbTimelineHeadline a[data-medley-id="pagelet_timeline_medley_friends"]');
      if (friendsLink.length) {
        return checkContact(Base.Content.Core.Scraper.FacebookPerson.getProfile(html));
      } else {
        return checkContact(Base.Content.Core.Scraper.FacebookCompany.getProfile(html));
      }
    };
    return checkContact = function(contact) {
      if (contact.profileId && (contact.lastName || contact.companyName)) {
        return contact;
      } else {
        return null;
      }
    };
  });

}).call(this);

(function() {
  var isFacebookUrl, isLinkedInUrl,
    _this = this;

  isLinkedInUrl = function(url) {
    var parser;
    parser = window.document.createElement('a');
    parser.href = url;
    return parser.hostname.toLowerCase().match(/linkedin.com$/);
  };

  isFacebookUrl = function(url) {
    var parser;
    parser = window.document.createElement('a');
    parser.href = url;
    return parser.hostname.toLowerCase().match(/facebook.com$/);
  };

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    var contact;
    if (request.name === 'getContact') {
      if (isLinkedInUrl(request.url)) {
        contact = Base.Content.Core.Scraper.getLinkedInContact();
        sendResponse({
          contact: contact
        });
      }
      if (isFacebookUrl(request.url)) {
        contact = Base.Content.Core.Scraper.getFacebookContact();
        return sendResponse({
          contact: contact
        });
      }
    } else if (request.name === 'showOverlaySaving') {
      return Base.Content.Core.Overlay.showSaving();
    } else if (request.name === 'showOverlaySuccess') {
      return Base.Content.Core.Overlay.showSuccess(request.profile);
    } else if (request.name === 'showOverlayError') {
      return Base.Content.Core.Overlay.showError();
    }
  });

}).call(this);
