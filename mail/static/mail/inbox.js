document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  //Send email on submit
  document.querySelector('#compose-form').onsubmit = send_email;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach(email => view_emails(email, mailbox));
    });
}

function send_email() {

  //define variable to save compose-form values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result)
    });
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function view_emails(email, mailbox) {

  //create html to display emails 
  const emailDiv = document.createElement('div');
  emailDiv.id = 'email';
  emailDiv.className = 'row';

  // sender 
  const sender = document.createElement('div');
  sender.id = 'email-sender';
  sender.className = 'col-lg-2';
  console.log(`Mailbox: ${mailbox}`);
  sender.innerHTML = email.sender;
  emailDiv.append(sender);

  //subject
  const subject = document.createElement('div');
  subject.id = 'email-subject';
  subject.className = 'col';
  subject.innerHTML = email.subject;
  emailDiv.append(subject);

  //archive-icon
  console.log(mailbox);
  if (mailbox !== 'sent') {
    const button = document.createElement('img');
    button.id = 'archive-icon';
    button.src = 'static/mail/archive-icon12.png'
    button.innerHTML = 'Archive';
    emailDiv.append(button)
    //change archive status by clicking on archive icon
    button.addEventListener('click', () => change_archive_status(email.id, email.archived));
  }

  //read-icon
  console.log(mailbox)
  if (mailbox !== 'sent') {
    const readButton = document.createElement('img');
    readButton.id = 'read-icon';
    if (email.read == true) {
      readButton.src = 'static/mail/read-icon1.png';
    } else {
      readButton.src = 'static/mail/unread-icon.png';
    }
    readButton.innerHTML = 'Read';
    emailDiv.append(readButton)
    //change read status by clicking on read icon
    readButton.addEventListener('click', () => change_read_status(email.id, email.read));
  }

  //timestamp
  const timestamp = document.createElement('div');
  timestamp.id = 'email-timestamp';
  timestamp.className = 'col';
  timestamp.innerHTML = email.timestamp;
  emailDiv.append(timestamp);

  //email-card
  const emailCard = document.createElement('div')
  emailCard.id = 'email-card';
  if (email.read === false) {
    emailCard.style.backgroundColor = 'white';
  } else {
    emailCard.style.backgroundColor = 'rgba(242,245,245,0.8)';;
  }
  emailCard.append(emailDiv);
  document.querySelector('#emails-view').append(emailCard);



  //display email by clicking on sender, subject, or timestamp
  sender.addEventListener('click', () => view_email(email.id));
  subject.addEventListener('click', () => view_email(email.id));
  timestamp.addEventListener('click', () => view_email(email.id));
}
