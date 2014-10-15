(function() {
  $(document).ready(function() {
    $("#login_form").submit(function() {
      return false;
    });
    return $("#login_form :submit").click(function() {
      var callback, data, email, password;
      $("#error").hide();
      $('#remember button').prop('disabled', true);
      email = $("#user_email").val();
      password = $("#user_password").val();
      callback = function(response) {
        if (response.apiToken) {
          $("#login_form").hide();
          $("#h1_text").hide();
          $("#success").show();
          return setTimeout((function() {
            return window.close();
          }), 1000);
        } else {
          $("#error").show();
          return $('#remember button').prop('disabled', false);
        }
      };
      data = {
        name: 'login',
        email: email,
        password: password
      };
      return chrome.runtime.sendMessage(data, callback);
    });
  });

}).call(this);
