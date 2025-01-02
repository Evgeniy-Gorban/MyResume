document.querySelectorAll(".show-more-button").forEach(function (button) {
  button.addEventListener("click", function () {
    const hideRows =
      this.closest(".action-item").querySelector(".extra-hideRows");

    if (hideRows.style.display === "none" || hideRows.style.display === "") {
      hideRows.style.display = "block";

      this.textContent = "Приховати";
    } else {
      hideRows.style.display = "none";

      this.textContent = "Читати далі...";
    }
  });
});
