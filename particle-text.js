// For Velo API Reference documentation visit https://www.wix.com/velo/reference/api-overview
import wixWidget from 'wix-widget';
import wixEditor from 'wix-editor';
import wixApplication from 'wix-application';

$w.onReady(async function () {
    // Initialize panel elements with widget property values
    const props = await wixWidget.getProps();
    $w('#textInput').value = props.text || 'Shimmer';
    $w('#particleSpeedSlider').value = props.particleSpeed || 1;
    $w('#particleDensitySlider').value = props.particleDensity || 0.5;
    $w('#particleColorPicker').value = props.particleColor || '#FFD700';
    $w('#fontSizeSlider').value = props.fontSize || 5;
    $w('#backgroundColorPicker').value = props.backgroundColor || '#1A1A1A';
    $w('#fontColorPicker').value = props.fontColor || '#FFFFFF';
    $w('#fontFamilyDropdown').value = props.fontFamily || 'Playfair Display';

    // Hardcoded list of Wix-supported font families
    const fontFamilies = [
        "Arial Black", "Assistant Light", "Assistant Semi Bold", "Avenida", "Avenir", "Avenir Light", "Bai Jamjuree",
        "Barlow Extra Light", "Barlow Medium", "Basic", "Belinda", "Bodoni Poster", "Braggadocio", "Brandon Grotesque",
        "Bree", "Caudex", "Caveat", "Chelsea Market", "Cinzel", "Clarendon Lt", "Comic Sans MS", "Cookie", "Coquette",
        "Corben", "Cormorant Garamond Light", "Cormorant Garamond Semi Bold", "Courier New", "DIN Neuzeit Grotesk",
        "DIN Next Light", "Damion", "Dancing Script Regular", "Droid Serif", "EB Garamond", "Enriqueta", "Fahkwang",
        "Forum", "Fraunces", "Fraunces 120 Light", "Fraunces 120 Semi Bold", "Fredericka the Great", "Futura",
        "Futura Light", "Georgia", "Geotica Four Open", "Heebo Light", "Heebo Medium", "Helvetica", "Helvetica Bold",
        "Helvetica Light", "ITC Arecibo", "Impact", "Inknut Antiqua", "Jockey One", "Josefin Slab", "Jura", "K2D",
        "Kanit", "Karantina Light", "Kelly Slab", "Kepler", "Kodchasan", "Lato Light", "Libre Baskerville",
        "Linotype Didot", "Lobster", "Lucida Console", "Lucida Sans Unicode", "Lulo Clean", "Maitree", "Marck Script",
        "Marmelad", "Marzo", "Mitr", "Monoton", "Monotype Baskerville", "Montserrat", "Mr De Haviland", "Museo",
        "Museo Slab", "Niconne", "Nimbus Sans", "Nobile", "Noticia Text", "Open Sans", "Open Sans Condensed",
        "Oswald Extra Light", "Oswald Medium", "Overlock", "Pacifica Condensed", "Palatino Linotype", "Patrick Hand",
        "Peaches & Cream", "Play", "Playfair Display", "Playfair Display Bold", "Poppins Extra Light",
        "Poppins Semi Bold", "Pridi", "Prompt", "Proxima Nova", "Questrial", "Quicksand", "Raleway",
        "Raleway Semi Bold", "Reklame Script", "Roboto Bold", "Roboto Thin", "Rosewood", "Rozha One", "Rubik Light",
        "Rubik Medium", "Sacramento", "Sail", "Sarabun", "Sarina", "Secular One", "Signika", "Snell Roundhand",
        "Soho Condensed", "Space Grotesk", "Spinnaker", "Sriracha", "Stencil", "Suez One", "Syne", "Tahoma",
        "Times New Roman", "Trend", "Trirong", "Varela Round", "Verdana", "Wix Madefor Display",
        "Wix Madefor Display Bold", "Wix Madefor Display Xbold", "Wix Madefor Text", "Wix Madefor Text Bold",
        "Wix Madefor Text Medium", "Wix Madefor Text Xbold", "Work Sans Extra Light", "Work Sans Semi Bold"
    ];

    $w('#fontFamilyDropdown').options = fontFamilies.map(font => ({ label: font, value: font }));

    // Set link to the upgrade page
    const appInstance = await wixApplication.getDecodedAppInstance();
    const upgradeURL = `https://www.wix.com/apps/upgrade/${appInstance.appDefId}?appInstanceId=${appInstance.instanceId}`;
    $w('#upgradeText').link = upgradeURL;

    // Handle changes in panel elements
    $w('#textInput').onChange((event) => {
        wixWidget.setProps({ text: event.target.value });
    });
    $w('#particleSpeedSlider').onChange((event) => {
        wixWidget.setProps({ particleSpeed: Number(event.target.value) });
    });
    $w('#particleDensitySlider').onChange((event) => {
        wixWidget.setProps({ particleDensity: Number(event.target.value) });
    });
    $w('#particleColorPicker').onChange((event) => {
        wixWidget.setProps({ particleColor: event.target.value });
    });
    $w('#fontSizeSlider').onChange((event) => {
        wixWidget.setProps({ fontSize: Number(event.target.value) });
    });
    $w('#backgroundColorPicker').onChange((event) => {
        wixWidget.setProps({ backgroundColor: event.target.value });
    });
    $w('#fontColorPicker').onChange((event) => {
        wixWidget.setProps({ fontColor: event.target.value });
    });
    $w('#fontFamilyDropdown').onChange((event) => {
        wixWidget.setProps({ fontFamily: event.target.value });
    });
});
