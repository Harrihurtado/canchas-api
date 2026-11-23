// Agrega matchers como toBeInTheDocument() y toBeDisabled()
import '@testing-library/jest-dom';

// Cada prueba empieza sin sesión guardada
beforeEach(() => localStorage.clear());
