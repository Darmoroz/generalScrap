async function checkEmail(toEmail) {
	const response = await fetch('http://localhost:8080/v0/check_email', {
			method: 'POST',
			headers: {
					'Content-Type': 'application/json'
			},
			body: JSON.stringify({
					to_email: toEmail,
					smtp_port: 587
			})
	});

	if (response.ok) {
			const data = await response.json();
			console.log('Email check result:', data);
	} else {
			console.error('Error checking email:', response.statusText);
	}
}

// Виклик функції для перевірки email
checkEmail('darmoroz99@gmail.com');
