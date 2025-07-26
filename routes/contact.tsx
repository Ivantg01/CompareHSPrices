export default function About() {
  return (
    <section id="about-section" class="py-5 bg-light">
      <div class="container">
        <div class="row justify-content-center align-items-center">
          {/* Badge SVG con iniciales */}
          <div class="col-md-4 text-center mb-4 mb-md-0">
            <span style="display:inline-block;">
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="90"
                  cy="90"
                  r="85"
                  fill="#0d6efd"
                  stroke="#fff"
                  stroke-width="6"
                />
                <text
                  x="50%"
                  y="54%"
                  text-anchor="middle"
                  font-family="'Pacifico', cursive, 'Comic Sans MS', sans-serif"
                  font-size="70"
                  fill="#fff"
                  dy=".3em"
                  style="letter-spacing:0.1em;"
                >
                  ITG
                </text>
              </svg>
            </span>
            <div class="mt-3">
              <span class="badge rounded-pill bg-primary fs-5 shadow">
                Iván Torrijos Gómez
              </span>
            </div>
          </div>

          {/* Información */}
          <div class="col-md-7">
            <h2 class="mb-3">Iván Torrijos Gómez</h2>
            <h5 class="text-primary mb-4">
              Estudiante de Ingeniería Informática
            </h5>
            <p class="text-muted fs-5">
              Actualmente cursando 4º año en la Universidad Nebrija. Me encanta
              la la tecnología y el desarrollo de software, siempre buscando
              aprender y crecer profesionalmente.
            </p>

            {/* Redes sociales */}
            <div class="d-flex gap-3 mt-4">
              <a
                href="https://linkedin.com/in/ivan-tg"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-primary d-flex align-items-center"
              >
                <i class="bi bi-linkedin fs-4 me-2"></i> LinkedIn
              </a>
              <a
                href="https://github.com/Ivantg01"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-dark d-flex align-items-center"
              >
                <i class="bi bi-github fs-4 me-2"></i> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
