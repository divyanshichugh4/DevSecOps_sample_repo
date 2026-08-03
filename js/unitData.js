/* ==========================================================================
   UNIT DATA - CONVERSION DEFINITIONS & FORMULAS
   ========================================================================== */

export const UNIT_CATEGORIES = {
    length: {
        label: 'Length',
        units: {
            m: { label: 'Meter (m)', factor: 1 },
            km: { label: 'Kilometer (km)', factor: 1000 },
            cm: { label: 'Centimeter (cm)', factor: 0.01 },
            mm: { label: 'Millimeter (mm)', factor: 0.001 },
            mile: { label: 'Mile (mi)', factor: 1609.344 },
            yard: { label: 'Yard (yd)', factor: 0.9144 },
            foot: { label: 'Foot (ft)', factor: 0.3048 },
            inch: { label: 'Inch (in)', factor: 0.0254 }
        }
    },
    weight: {
        label: 'Weight',
        units: {
            kg: { label: 'Kilogram (kg)', factor: 1 },
            g: { label: 'Gram (g)', factor: 0.001 },
            mg: { label: 'Milligram (mg)', factor: 0.000001 },
            lb: { label: 'Pound (lb)', factor: 0.45359237 },
            oz: { label: 'Ounce (oz)', factor: 0.028349523125 },
            ton: { label: 'Metric Ton (t)', factor: 1000 }
        }
    },
    temp: {
        label: 'Temperature',
        units: {
            c: { label: 'Celsius (°C)' },
            f: { label: 'Fahrenheit (°F)' },
            k: { label: 'Kelvin (K)' }
        },
        customConvert: (val, from, to) => {
            if (from === to) return val;
            // First convert to Celsius
            let celsius;
            if (from === 'c') celsius = val;
            else if (from === 'f') celsius = (val - 32) * (5 / 9);
            else if (from === 'k') celsius = val - 273.15;

            // Convert Celsius to target
            if (to === 'c') return celsius;
            if (to === 'f') return celsius * (9 / 5) + 32;
            if (to === 'k') return celsius + 273.15;
            return val;
        }
    },
    volume: {
        label: 'Volume',
        units: {
            l: { label: 'Liter (L)', factor: 1 },
            ml: { label: 'Milliliter (mL)', factor: 0.001 },
            gal: { label: 'US Gallon (gal)', factor: 3.78541 },
            cup: { label: 'US Cup', factor: 0.236588 },
            fl_oz: { label: 'Fluid Ounce (fl oz)', factor: 0.0295735 }
        }
    },
    speed: {
        label: 'Speed',
        units: {
            m_s: { label: 'Meter/sec (m/s)', factor: 1 },
            km_h: { label: 'Km/hour (km/h)', factor: 0.277778 },
            mph: { label: 'Miles/hour (mph)', factor: 0.44704 },
            knot: { label: 'Knot (kt)', factor: 0.514444 }
        }
    },
    storage: {
        label: 'Data Storage',
        units: {
            byte: { label: 'Byte (B)', factor: 1 },
            kb: { label: 'Kilobyte (KB)', factor: 1024 },
            mb: { label: 'Megabyte (MB)', factor: 1048576 },
            gb: { label: 'Gigabyte (GB)', factor: 1073741824 },
            tb: { label: 'Terabyte (TB)', factor: 1099511627776 }
        }
    }
};

export function convertValue(val, categoryKey, fromUnitKey, toUnitKey) {
    const cat = UNIT_CATEGORIES[categoryKey];
    if (!cat) return 0;

    if (cat.customConvert) {
        return cat.customConvert(val, fromUnitKey, toUnitKey);
    }

    const fromObj = cat.units[fromUnitKey];
    const toObj = cat.units[toUnitKey];
    if (!fromObj || !toObj) return 0;

    // Convert from -> base -> to
    const baseVal = val * fromObj.factor;
    const targetVal = baseVal / toObj.factor;
    return targetVal;
}
