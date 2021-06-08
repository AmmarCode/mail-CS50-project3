document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Send email on submit of compose form
  document.querySelector('#compose-form').onsubmit = send_email;

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
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
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
      load_mailbox('sent', result)
    });  
  return false;
}

function view_emails(email, mailbox) {

  //create html to display emails 
  const emailDiv = document.createElement('div');
  emailDiv.id = 'email';
  emailDiv.className = 'row';

  // sender or recipient
  const sender = document.createElement('div');
  const recipient = document.createElement('div');
  recipient.id = 'email-recipient'
  recipient.className = 'col-lg-2'
  recipient.innerHTML = email.recipients;
  sender.id = 'email-sender';
  sender.className = 'col-lg-2';
  console.log(`Mailbox: ${mailbox}`);
  sender.innerHTML = email.sender;
  if (mailbox === 'inbox' || mailbox === 'archive') {
    emailDiv.append(sender);
  } else {
    emailDiv.append(recipient);
  }
  
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
  recipient.addEventListener('click', () => view_email(email.id));
  subject.addEventListener('click', () => view_email(email.id));
  timestamp.addEventListener('click', () => view_email(email.id));
}

function view_email(email_id) {

  //show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display - 'none';

  //fetch email details
  fetch(`/emails/${email_id}`, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(email => {
      //mark email as read
      mark_as_read(email_id);
      console.log(email);
      //display email details 
      document.querySelector('#email-view-sender').innerHTML = '<strong>From: </strong>' + email.sender;
      document.querySelector('#email-view-recipient').innerHTML = '<strong>To:  </strong>' + email.recipients;
      document.querySelector('#email-view-timestamp').innerHTML = '<strong>Date: </strong>' + email.timestamp;
      document.querySelector('#email-view-subject').innerHTML = '<strong>Subject: </strong>' + email.subject;
      document.querySelector('#email-view-body').innerHTML = email.body;

      //display archive button matching to archive status
      if (email.archived === true) {
        document.querySelector('#change-archive-status').innerHTML = 'Unarchive';
      } else {
        document.querySelector('#change-archive-status').innerHTML = 'Archive';
      }
      //Change archive status by clicking on archive icon
      document.getElementById('change-archive-status').addEventListener('click', () => change_archive_status(email.id, email.archived));
      // Change read status by clicking on read icon
      document.getElementById('reply-email-button').addEventListener('click', () => reply_to_email(email));
    });

  return false;
}

function change_archive_status(email_id, previousValue) {

  //Change archive status to opposite of current status
  const newValue = !previousValue;
  console.log(`updating email as archived = ${newValue}`);
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: newValue
    })
  })
  .catch(error => {
    console.log("Error:", error);
  });
  load_mailbox('inbox');
  window.location.reload();
}

function change_read_status(email_id, previousValue) {

  //change read status to opposite of current status
  const newValue = !previousValue;
  console.log(`Changed email read status`);
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: newValue
    })
  })
  .catch(error => {
    console.log("Error:", error);
  });
  load_mailbox('inbox')
}

function mark_as_read(email_id) {

  //mark email as read
  console.log('Marking email as read');
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function reply_to_email(email) {

  //Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //assign recipient to the sender of the initial email
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.indexOf('Re:') === -1) {
    email.subject = 'Re: ' + email.subject;
  }

  //fill initial email details in the reply form
  document.querySelector('#compose-subject').value = email.subject;
  document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp} ${email.sender} wrote:\n \n${email.body}`;
}
