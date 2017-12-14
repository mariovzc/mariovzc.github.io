$(".button-collapse").sideNav();

$(document).ready(function () {
  $(document).on("scroll", onScroll);

  $('.trans-element a[href^="#"]').on('click', function (e) {
    e.preventDefault();
    $(document).off("scroll");

    $('.trans-element a').each(function () {
      $(this).removeClass('active');
    })
    $(this).addClass('active');

    var target = this.hash;
    $target = $(target);
    $('html, body').stop().animate({
      'scrollTop': $target.offset().top +2
    }, 500, 'swing', function () {
      window.location.hash = target;
      $(document).on("scroll", onScroll);
    });
  });
});

function onScroll(event){
  var scrollPosition = $(document).scrollTop();
  $('.trans-element a').each(function () {
    var currentLink = $(this);
    var refElement = $(currentLink.attr("href"));
    if (refElement.position().top <= scrollPosition && refElement.position().top + refElement.height() > scrollPosition) {
      $('.trans-element a').removeClass("active");
      currentLink.addClass("active");
    }
    else{
      currentLink.removeClass("active");
    }
  });
}