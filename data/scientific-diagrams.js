// Edugates-ClipSAT Science Labs - Master Scientific Diagrams & Visual Models
// High-fidelity, precision vector SVG illustrations for diagram-based assessment questions.
// Features calibrated axes, accurate scientific symbols, coordinate labels, and authentic laboratory models.
// Contains 30 diagrams per subject (CHEM: 30, BIO: 30, PHYS: 30 = 90 total diagrams).

import { CHEM_DIAGRAMS } from "./diagrams-chem.js";
import { BIO_DIAGRAMS } from "./diagrams-bio.js";
import { PHYS_DIAGRAMS } from "./diagrams-phys.js";

export { CHEM_DIAGRAMS } from "./diagrams-chem.js";
export { BIO_DIAGRAMS } from "./diagrams-bio.js";
export { PHYS_DIAGRAMS } from "./diagrams-phys.js";

export const SCIENTIFIC_DIAGRAMS = {
  ...CHEM_DIAGRAMS,
  ...BIO_DIAGRAMS,
  ...PHYS_DIAGRAMS
};

/**
 * Retrieves diagram object by unique ID
 */
export function getDiagramById(id) {
  return SCIENTIFIC_DIAGRAMS[id] || null;
}

/**
 * Returns all diagrams matching a subject and module
 */
export function getDiagramsForModule(subject, moduleId) {
  return Object.values(SCIENTIFIC_DIAGRAMS).filter(d => 
    d.subject === subject && d.moduleId === Number(moduleId)
  );
}
