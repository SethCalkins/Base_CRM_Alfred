(function() {
  $(document).ready(function() {
    var defaultClipAs, initRadio, showUpgradeMessage;
    defaultClipAs = 'lead';
    initRadio = function() {
      var clipAs;
      clipAs = window.localStorage['clipas'] || defaultClipAs;
      if (clipAs === 'lead') {
        return $('#clip_as_lead').attr('checked', true);
      } else {
        return $('#clip_as_contact').attr('checked', true);
      }
    };
    $('#save').click(function(e) {
      var clipAs;
      clipAs = $('input[name=clipas]:checked').val() || defaultClipAs;
      window.localStorage['clipas'] = clipAs;
      $('#save').css({
        'visibility': 'hidden'
      });
      $('#status').html('Options saved.');
      return $('#base-clipper-options').fadeOut(500, (function() {
        return window.close();
      }));
    });
    showUpgradeMessage = function() {
      if (window.location.search.match('update=true')) {
        return $('#base-clipper-options .upgrade-message').css('display', 'block');
      }
    };
    initRadio();
    return showUpgradeMessage();
  });

}).call(this);
