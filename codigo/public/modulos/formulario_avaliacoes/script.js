document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const ratingSelected = document.querySelector('input[name="rating"]:checked');
    const commentText = document.getElementById('comment').value;

    if (!ratingSelected) {
        alert("Por favor, selecione uma nota em estrelas.");
        return;
    }

    const formData = {
        nota: ratingSelected.value,
        comentario: commentText
    };

    console.log("Dados da Sprint Prontos para Envio:", formData);

    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = "✓ Avaliação enviada com sucesso! Obrigado.";
    messageDiv.className = "success-msg";

    document.getElementById('feedbackForm').reset();
});