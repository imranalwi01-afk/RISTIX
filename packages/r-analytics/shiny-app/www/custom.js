/* =============================================================================
   IFRS9 ANALYTICS CUSTOM JAVASCRIPT
   =============================================================================
   Purpose: Minimal surgical fixes for UI issues
   ============================================================================= */

$(document).ready(function() {

  // Fix: Force selectize dropdown to close when clicking outside
  $(document).on('click', function(e) {
    // Check if click is outside any selectize control
    if (!$(e.target).closest('.selectize-control').length) {
      // Close all open selectize dropdowns
      $('.selectize-control').each(function() {
        var selectizeInstance = $(this)[0].selectize;
        if (selectizeInstance) {
          selectizeInstance.close();
        }
      });
    }
  });

  // Prevent dropdown from staying open after selection
  $(document).on('change', '.selectize-input', function() {
    var selectizeControl = $(this).closest('.selectize-control')[0];
    if (selectizeControl && selectizeControl.selectize) {
      setTimeout(function() {
        selectizeControl.selectize.close();
      }, 100);
    }
  });

  // Fix: DT Table Horizontal Scroll Synchronization
  // This ensures header and body scroll together horizontally
  $('.dataTables_scroll').each(function() {
    var $wrapper = $(this);
    var $head = $wrapper.find('.dataTables_scrollHead');
    var $body = $wrapper.find('.dataTables_scrollBody');

    if ($head.length && $body.length) {
      // Sync horizontal scrolling between header and body
      $head.on('scroll', function() {
        $body.scrollLeft($(this).scrollLeft());
      });

      $body.on('scroll', function() {
        $head.scrollLeft($(this).scrollLeft());
      });

      // Initialize scroll position
      $body.scrollLeft($head.scrollLeft());
    }
  });

  // Fix: DT Table Responsive Width Adjustment
  // This ensures tables have proper width and don't break layout
  $(document).on('draw.dt', function() {
    var $table = $(this).find('table.dataTable');
    if ($table.length) {
      var $wrapper = $table.closest('.dataTables_wrapper');
      var $scrollHead = $wrapper.find('.dataTables_scrollHeadInner');
      var $scrollBody = $wrapper.find('.dataTables_scrollBodyInner');

      // Ensure header and body have same width
      if ($scrollHead.length && $scrollBody.length) {
        var maxWidth = Math.max($scrollHead.outerWidth(), $scrollBody.outerWidth());
        $scrollHead.css('width', maxWidth + 'px');
        $scrollBody.css('width', maxWidth + 'px');
      }
    }
  });

});

/* =============================================================================
   END OF CUSTOM JAVASCRIPT
   ============================================================================= */