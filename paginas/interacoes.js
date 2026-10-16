const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    const query = new URLSearchParams(window.location.search);
    const message = contactForm.elements.namedItem("mensagem");

    if (query.get("assunto") === "ingressos" && message instanceof HTMLTextAreaElement) {
        message.value = "Olá! Gostaria de informações sobre ingressos para The Batman.";
    }

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const subject = query.get("assunto") === "ingressos"
            ? "Informações sobre ingressos para The Batman"
            : "Mensagem pelo site The Batman";
        const body = [
            `Nome: ${formData.get("nome")}`,
            `Email: ${formData.get("email")}`,
            "",
            String(formData.get("mensagem"))
        ].join("\n");
        const status = document.querySelector("#contact-status");

        if (status) {
            status.textContent = "Abrindo seu aplicativo de e-mail para concluir o envio.";
        }

        window.location.href = `mailto:thugbrn@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

const commentForm = document.querySelector("#comment-form");

if (commentForm) {
    const storageKey = "batman-site-comments";
    const commentsList = document.querySelector("#comments-list");
    const status = document.querySelector("#comment-status");

    const showComments = () => {
        if (!(commentsList instanceof HTMLElement)) {
            return;
        }

        const savedComments = localStorage.getItem(storageKey);
        const comments = savedComments ? JSON.parse(savedComments) : [];

        if (!Array.isArray(comments)) {
            throw new Error("Os comentários salvos possuem um formato inválido.");
        }

        commentsList.replaceChildren();

        comments.forEach((comment) => {
            if (typeof comment?.name !== "string" || typeof comment?.text !== "string") {
                return;
            }

            const article = document.createElement("article");
            const author = document.createElement("h4");
            const text = document.createElement("p");

            article.className = "comment-item";
            author.textContent = comment.name;
            text.textContent = comment.text;
            article.append(author, text);
            commentsList.append(article);
        });
    };

    try {
        showComments();
    } catch (error) {
        if (status) {
            status.textContent = "Não foi possível carregar os comentários salvos neste navegador.";
        }
        console.error("Falha ao carregar comentários salvos.", error);
    }

    commentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(commentForm);
        const comment = {
            name: String(formData.get("nome")).trim(),
            text: String(formData.get("comentario")).trim()
        };

        try {
            const savedComments = localStorage.getItem(storageKey);
            const comments = savedComments ? JSON.parse(savedComments) : [];

            if (!Array.isArray(comments)) {
                throw new Error("Os comentários salvos possuem um formato inválido.");
            }

            comments.push(comment);
            localStorage.setItem(storageKey, JSON.stringify(comments));
            showComments();
            commentForm.reset();

            if (status) {
                status.textContent = "Comentário publicado neste navegador.";
            }
        } catch (error) {
            if (status) {
                status.textContent = "Não foi possível salvar o comentário neste navegador.";
            }
            console.error("Falha ao salvar comentário.", error);
        }
    });
}

document.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", async () => {
        const status = document.querySelector("#share-status");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    url: window.location.href
                });
                return;
            }

            if (!navigator.clipboard) {
                throw new Error("O compartilhamento não está disponível neste navegador.");
            }

            await navigator.clipboard.writeText(window.location.href);
            if (status) {
                status.textContent = "Link copiado. Agora você pode compartilhar.";
            }
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }
            if (status) {
                status.textContent = "Não foi possível compartilhar o link neste navegador.";
            }
            console.error("Falha ao compartilhar página.", error);
        }
    });
});

const galleryItems = Array.from(document.querySelectorAll(".gallery-items"));
const imageViewer = document.querySelector(".image-viewer");

if (galleryItems.length > 0 && imageViewer instanceof HTMLDialogElement) {
    const viewerImage = imageViewer.querySelector(".image-viewer-image");
    const viewerCaption = imageViewer.querySelector(".image-viewer-caption");
    const viewerCount = imageViewer.querySelector(".image-viewer-count");
    const closeButton = imageViewer.querySelector(".image-viewer-close");
    const previousButton = imageViewer.querySelector(".image-viewer-previous");
    const nextButton = imageViewer.querySelector(".image-viewer-next");
    let currentImage = 0;

    if (
        viewerImage instanceof HTMLImageElement
        && viewerCaption instanceof HTMLElement
        && viewerCount instanceof HTMLElement
        && closeButton instanceof HTMLButtonElement
        && previousButton instanceof HTMLButtonElement
        && nextButton instanceof HTMLButtonElement
    ) {
        const showImage = (index) => {
            currentImage = (index + galleryItems.length) % galleryItems.length;
            const link = galleryItems[currentImage];
            const thumbnail = link.querySelector("img");

            if (thumbnail instanceof HTMLImageElement) {
                viewerImage.src = link.href;
                viewerImage.alt = thumbnail.alt;
                viewerCaption.textContent = thumbnail.alt;
                viewerCount.textContent = `${currentImage + 1} de ${galleryItems.length}`;
            }
        };

        galleryItems.forEach((link, index) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                showImage(index);
                imageViewer.showModal();
                closeButton.focus();
            });
        });

        previousButton.addEventListener("click", () => showImage(currentImage - 1));
        nextButton.addEventListener("click", () => showImage(currentImage + 1));
        closeButton.addEventListener("click", () => imageViewer.close());

        imageViewer.addEventListener("click", (event) => {
            if (event.target === imageViewer) {
                imageViewer.close();
            }
        });

        imageViewer.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showImage(currentImage - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                showImage(currentImage + 1);
            } else if (event.key === "Escape") {
                event.preventDefault();
                imageViewer.close();
            }
        });

        imageViewer.addEventListener("cancel", (event) => {
            event.preventDefault();
            imageViewer.close();
        });
    }
}
