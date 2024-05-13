// Udregning af BMR ud fra køn, alder og vægt og returnerer BMR
export function beregningAfBMR(Alder, Vægt, Køn) {
    let BMR = 0;
    
    // Beregning af BMR ud fra køn, alder og vægt
    if (Køn === "Mand") {
        if (Alder < 3) {
            BMR = 0.249 * Vægt - 0.13
        }
        else if (Alder >= 4 && Alder <= 10) {
            BMR = 0.095 * Vægt + 2.11
        }
        else if (Alder >= 11 && Alder <= 18) {
            BMR = 0.074 * Vægt + 2.75
        }
        else if (Alder >= 19 && Alder <= 30) {
            BMR = 0.064 * Vægt + 2.84
        }
        else if (Alder >= 31 && Alder <= 60) {
            BMR = 0.0485 * Vægt + 3.67
        }
        else if (Alder >= 61 && Alder <= 75) {
            BMR = 0.0499 * Vægt + 2.93
        }
        else if (Alder > 75){
            BMR = 0.035 * Vægt + 3.43
        }
    } else {
        if (Alder < 3) {
            BMR = 0.244 * Vægt - 0.13
        }
        else if (Alder <= 4 && Alder >= 10) {
            BMR = 0.085 * Vægt + 2.03
        }
        else if (Alder <= 11 && Alder >= 18) {
            BMR = 0.056 * Vægt + 2.90 
        }
        else if (Alder <= 19 && Alder >= 30) {
            BMR = 0.056 * Vægt + 2.90 
        }
        else if (Alder <= 31 && Alder >= 60) {
            BMR = 0.0364 * Vægt +3.47
        }
        else if (Alder <= 61 && Alder >= 75) {
            BMR = 0.0386 * Vægt + 2.88
        }
        else if (Alder > 75) {
            BMR = 0.0410 * Vægt + 2.61
        }
    }

    return BMR.toFixed(2);
}
