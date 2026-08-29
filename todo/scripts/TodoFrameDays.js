/* global VT */
window.VT = window.VT || {};

VT.TodoFrameDays = function (el) {
  var RANGE = 14;
  var state = {
    items: [],
    at: VT.formatDateId(new Date()),
  };

  el.innerHTML = [
    '<nav class="leftcontrols">',
    '  <p><button class="app-button -circle -xl backward" aria-label="Previous day"><i class="app-icon" data-id="chevron-left-24"></i></button></p>',
    '  <p><button class="app-button fastbackward" aria-label="Jump back a week"><i class="app-icon -double" data-id="chevron-left-16"></i></i></button></p>',
    '  <p><button class="app-button home" aria-label="Jump to today"><i class="app-icon" data-id="home-16"></i></button></p>',
    '</nav>',
    '<div class="container"></div>',
    '<nav class="rightcontrols">',
    '  <p><button class="app-button -circle -xl forward" aria-label="Next day"><i class="app-icon" data-id="chevron-right-24"></i></button></p>',
    '  <p><button class="app-button fastforward" aria-label="Jump forward a week"><i class="app-icon -double" data-id="chevron-right-16"></i></button></p>',
    '</nav>',
  ].join('\n');

  setTimeout(function () {
    el.classList.add('-animated');
  }, 200);

  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  el.querySelector('.backward').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('seek', { detail: -1, bubbles: true }));
  });

  el.querySelector('.forward').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('seek', { detail: 1, bubbles: true }));
  });

  el.querySelector('.fastbackward').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('seek', { detail: -5, bubbles: true }));
  });

  el.querySelector('.fastforward').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('seek', { detail: 5, bubbles: true }));
  });

  el.querySelector('.home').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('seekHome', { bubbles: true }));
  });

  el.todoFrameDays = {
    update: update,
  };

  function update(next) {
    Object.assign(state, next);

    var days = getDays();

    var container = el.querySelector('.container');
    var obsolete = new Set(container.children);
    var childrenByKey = new Map();

    obsolete.forEach(function (child) {
      childrenByKey.set(child.dataset.key, child);
    });

    var children = days.map(function (day) {
      var child = childrenByKey.get(day.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.className = 'card todo-day';
        child.dataset.key = day.id;
        VT.TodoDay(child);
      }

      child.todoDay.update(day);
      child.style.transform = 'translateX(' + day.position * 100 + '%)';

      return child;
    });

    obsolete.forEach(function (child) {
      container.removeChild(child);
    });

    children.forEach(function (child, index) {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });

    updateHeight();
  }

  function updateHeight() {
    var height = 280;
    var container = el.querySelector('.container');

    for (var i = 0, l = container.children.length; i < l; ++i) {
      height = Math.max(container.children[i].offsetHeight, height);
    }

    el.style.height = height + 50 + 'px';
  }

  function getDays() {
    var days = [];

    for (var i = 0; i < 2 * RANGE; ++i) {
      var t = VT.parseDateId(state.at);
      t.setDate(t.getDate() - RANGE + i);
      var id = VT.formatDateId(t);

      days.push({
        id: id,
        items: getItemsForDay(id),
        position: -RANGE + i,
      });
    }

    return days;
  }

  function getItemsForDay(dateId) {
    var items = state.items.filter(function (item) {
      return item.listId === dateId;
    });

    items.sort(function (a, b) {
      return a.index - b.index;
    });

    return items;
  }
};
