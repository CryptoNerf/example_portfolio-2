(function () {
    var section = document.getElementById('philosophy3Section');
    var overlay = document.getElementById('chakraLinks');

    if (!section || !overlay) return;

    function update() {
        var rect = section.getBoundingClientRect();

        if (rect.top <= 0) {
            if (!overlay.classList.contains('is-fixed')) {
                var oRect = overlay.getBoundingClientRect();
                overlay.style.top    = oRect.top    + 'px';
                overlay.style.left   = oRect.left   + 'px';
                overlay.style.width  = oRect.width  + 'px';
                overlay.style.height = oRect.height + 'px';
                overlay.classList.add('is-fixed');
            }
        } else {
            if (overlay.classList.contains('is-fixed')) {
                overlay.classList.remove('is-fixed');
                overlay.style.top    = '';
                overlay.style.left   = '';
                overlay.style.width  = '';
                overlay.style.height = '';
            }
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}());
