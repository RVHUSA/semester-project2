export function showSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.classList.remove("hidden");
  }
}

export function hideSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.classList.add("hidden");
  }
}
