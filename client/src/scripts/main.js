function timeAgo(timestamp) {
  const createdAt = moment(timestamp);
  const now = moment();
  const diffYears = now.diff(createdAt, 'years');
  const diffMonths = now.diff(createdAt, 'months');
  const diffWeeks = Math.floor(now.diff(createdAt, 'weeks'));
  const diffDays = Math.floor(now.diff(createdAt, 'days'));
  let timeAgo;
  switch (true) {
    case diffYears > 0:
      timeAgo = `${diffYears}y`;
      break;
    case diffMonths > 0:
      timeAgo = `${diffMonths}m`;
      break;
    case diffWeeks > 0:
      timeAgo = `${diffWeeks}w`;
      break;
    case diffDays > 0:
      timeAgo = `${diffDays}d`;
      break;
    default:
      timeAgo = '0d';
  }
  return timeAgo;
}

function formatTimestamp(timestamp, compact) {
  if (!compact) {
    const now = moment();
    const date = moment(timestamp);
    if (now.isSame(date, 'day')) {
      return `Today ${date.format('h:mm A')}`;
    } else if (now.subtract(1, 'days').isSame(date, 'day')) {
      return `Yesterday ${date.format('h:mm A')}`;
    } else {
      return date.format('MMMM, YYYY');
    }
  } else {
    return moment(timestamp).format('h:mm A');
  }
}

function showFullSizeImage(src) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  const fullSizeImage = document.createElement('img');
  fullSizeImage.src = src;
  fullSizeImage.style.maxWidth = '90%';
  fullSizeImage.style.maxHeight = '90%';
  fullSizeImage.style.borderRadius = '10px';
  const closeButton = document.createElement('span');
  closeButton.className = 'material-symbols-outlined';
  closeButton.textContent = 'close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.fontSize = '40px';
  closeButton.style.color = 'white';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', function () {
    document.body.removeChild(overlay);
  });
  overlay.appendChild(fullSizeImage);
  overlay.appendChild(closeButton);
  document.body.appendChild(overlay);
}

function setBigView() {
  const chatContent = document.querySelector('.chat-content');
  const images = chatContent.querySelectorAll('img');
  images.forEach(image => {
    image.addEventListener('click', function () {
      showFullSizeImage(this.src);
    });
  });
}

function unloader(loading, error = {}) {
  const fr = document.querySelector('.unload');
  const note = document.querySelector('.note');
  if (!fr || !note) return;
  if (loading) {
    fr.style.display = 'flex';
    if (error.status) {
      note.textContent = error.message || 'Failed to connect to the server, try again later...';
      note.style.display = 'block';
    } else {
      note.style.display = 'none';
    }
  } else {
    fr.style.display = 'none';
  }
}

document.querySelector('.sort').addEventListener('click', function () {
  const dropdown = document.querySelector('.dropdown-menu');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

function readyMenuChats() {
  document.querySelectorAll('.message-bubble').forEach(message => {
    message.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      let messageId = message.closest('.message').id;
      console.log('Active message id: ', messageId);
      let dropdown = document.getElementById('dropdownMenu');
      dropdown.style.left = `${e.pageX}px`;
      dropdown.style.top = `${e.pageY}px`;
      dropdown.classList.add('active');
      dropdown.addEventListener('click', function (e) {
        if (e.target.classList.contains('message-dropdown-item')) {
          let action = e.target.id;
          switch (action) {
            case 'reply':
              MessageActionMenu.reply(messageId);
              break;
            case 'copy':
              MessageActionMenu.copy(messageId);
              break;
            case 'delete':
              MessageActionMenu.delete(messageId);
              break;
            case 'report':
              MessageActionMenu.report(messageId);
              break;
            default:
              console.log('Unknown action');
          }
        }
      });
    });
  });
  document.addEventListener('click', function () {
    document.getElementById('dropdownMenu').classList.remove('active');
  });
}