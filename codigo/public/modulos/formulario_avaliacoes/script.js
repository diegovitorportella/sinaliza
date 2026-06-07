const tagButtons = document.querySelectorAll('.tag-btn');
const commentTextarea = document.getElementById('comment');

tagButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const tag = btn.dataset.tag;
        btn.classList.toggle('active');

        const current = commentTextarea.value;

        if (btn.classList.contains('active')) {
            commentTextarea.value = current
                ? current.trimEnd() + ', ' + tag
                : tag;
        } else {
            const pattern = new RegExp(
                '(,\\s*)?' + escapeRegex(tag) + '(\\s*,)?',
                'g'
            );
            commentTextarea.value = commentTextarea.value
                .replace(pattern, function(match, before, after) {
                    return (before && after) ? ',' : '';
                })
                .replace(/^,\s*/, '')
                .replace(/,\s*$/, '')
                .trim();
        }
    });
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const ratingSelected = document.querySelector('input[name="rating"]:checked');
    const commentText = commentTextarea.value;

    if (!ratingSelected) {
        alert("Por favor, selecione uma nota em estrelas.");
        return;
    }


    const activeTags = Array.from(tagButtons)
        .filter(function(b) { return b.classList.contains('active'); })
        .map(function(b) { return b.dataset.tag; });

    const formData = {
        nota: ratingSelected.value,
        tags: activeTags,
        comentario: commentText
    };

    console.log("Dados da Sprint Prontos para Envio:", formData);

    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = "✓ Avaliação enviada com sucesso! Obrigado.";
    messageDiv.className = "success-msg";

    document.getElementById('feedbackForm').reset();
    tagButtons.forEach(function(b) { b.classList.remove('active'); });
});