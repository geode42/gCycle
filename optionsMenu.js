const optionsDialog = document.getElementById('options-dialog')
const optionsMenu = document.getElementById('options-menu')
const mainElement = document.getElementsByTagName('main')[0]
const rootElement = document.documentElement
const lightThemeOptionsContainer = document.getElementById('light-theme-options-container')
const darkThemeOptionsContainer = document.getElementById('dark-theme-options-container')
const themeOverrideContainer = document.getElementById('theme-override-container')
const themeCustomizationMenu = document.getElementById('theme-customization-menu')
const optionsMenuOpenButton = document.getElementById('options-menu-open-button')
// const customizeThemeHeader = document.getElementById('customize-theme-header')
const themeColorMetaTag = document.getElementById('theme-color-meta-tag')
const themeOptionsContainer = document.getElementById('theme-options-container')
themeOptionsContainer.style.display = 'none'

// optionsDialog.showModal()
function createDiv(text='', className='') {
	const div = document.createElement('div')
	div.textContent = text
	div.className = className
	return div
}

const themes = [
	{
		'name': 'default-light',
		'displayName': 'Default Light',
		'fallback': 'default-light',
		'isDarkTheme': false,
		'colors': {
			'foreground': '000',
			'background': 'FFF',
			'speed': '000',
			'speed-units': 'AAA',
			'ride-stats': '444',
			'button-background': 'F4F4F4',
			'button-border': 'CCC',
		},
	},
	{
		'name': 'default-dark',
		'displayName': 'Default Dark',
		'fallback': 'default-dark',
		'isDarkTheme': true,
		'colors': {
			'foreground': 'DDD',
			'background': '111',
			'speed': 'DDD',
			'speed-units': '888',
			'ride-stats': 'BBB',
			'button-background': '222',
			'button-border': '444',
		},
	},
	{
		'name': 'custom-light',
		'displayName': 'Custom Light',
		'fallback': 'default-light',
		'isDarkTheme': false,
		'colors': {}
	},
	{
		'name': 'custom-dark',
		'displayName': 'Custom Dark',
		'fallback': 'default-dark',
		'isDarkTheme': true,
		'colors': {}
	},
	{
		'name': 'oled-dark',
		'displayName': 'OLED Dark',
		'fallback': 'default-dark',
		'isDarkTheme': true,
		'colors': {
			'background': '000000'
		}
	},
	{
		'name': 'monkeytype',
		'displayName': 'Monkeytype',
		'fallback': 'default-dark',
		'isDarkTheme': true,
		'colors': {
			'background': '323437',
			'speed': 'E2B714',
		}
	},
]


// Add base custom themes
// themes.push({name: 'custom-light', displayName: 'Custom Light', fallback: 'default-light', isDarkTheme: false, colors: structuredClone(getTheme('default-light').colors)})
// themes.push({name: 'custom-dark', displayName: 'Custom Dark', fallback: 'default-dark', isDarkTheme: true, colors: structuredClone(getTheme('default-dark').colors)})


let themeOverride = ''
let currentLightTheme = 'default-light'
let currentDarkTheme = 'default-dark'


function loadThemeOverride() {
	themeOverride = localStorage.getItem('theme-override') ?? themeOverride
}

function loadCurrentLightAndDarkThemes() {
	currentLightTheme = localStorage.getItem('active-light-theme') ?? currentLightTheme
	currentDarkTheme = localStorage.getItem('active-dark-theme') ?? currentDarkTheme
}

let useDarkTheme = false
let deviceDarkModePreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

function createThemeOverrideOptions() {
	themeOverrideContainer.append(
		createRadioButton('theme-override-button', 'Light', () => {themeOverride='light'; updatePrefersDark(); applyCurrentTheme(); localStorage.setItem('theme-override', 'light')}, themeOverride == 'light'),
		createRadioButton('theme-override-button', 'Dark', () => {themeOverride='dark'; updatePrefersDark(); applyCurrentTheme(); localStorage.setItem('theme-override', 'dark')}, themeOverride == 'dark'),
		createRadioButton('theme-override-button', 'Auto', () => {themeOverride=''; updatePrefersDark(); applyCurrentTheme(); localStorage.setItem('theme-override', '')}, themeOverride == '')
	)
}

function updatePrefersDark() {
	if (themeOverride == 'light') {
		useDarkTheme = false
		return
	}
	if (themeOverride == 'dark') {
		useDarkTheme = true
		return
	}
	useDarkTheme = deviceDarkModePreference
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
	deviceDarkModePreference = event.matches
	updatePrefersDark()
	applyCurrentTheme()
})

function updateCustomizeCurrentTheme() {
	// customizeThemeHeader.textContent = 'Customize __________'
	themeCustomizationMenu.replaceChildren()
	if (!(useDarkTheme ? currentDarkTheme.includes('custom') : currentLightTheme.includes('custom'))) {
		themeCustomizationMenu.append(createDiv('The active theme must be a "custom" theme to be customized!'))
		return
	}

	// customizeThemeHeader.textContent = `Customize ${useDarkTheme ? currentDarkTheme : currentLightTheme}`

	const theme = getTheme(useDarkTheme ? currentDarkTheme : currentLightTheme)

	const resetButton = document.createElement('button')
	resetButton.textContent = 'Reset to default theme'
	resetButton.onclick = () => {
		resetTheme(useDarkTheme ? currentDarkTheme : currentLightTheme)
	}

	
	const colorContainer = createDiv('', 'color-container')
	themeCustomizationMenu.append(resetButton, colorContainer)

	for (const color in getTheme(theme.fallback).colors) {
		const button = document.createElement('button')
		button.textContent = color
		button.onclick = () => {letUserChangeCSSVariableColor(useDarkTheme ? currentDarkTheme : currentLightTheme, color)}
		colorContainer.append(button)
	}
}

function currentThemeChange() {
	updateCustomizeCurrentTheme()
	updateThemeOptionsContainers()
}



function createRadioButton(group, text, onclick, active=false) {
	const button = document.createElement('button')
	button.textContent = text
	button.classList.add('radio-button')
	button.classList.add(group)
	if (active) button.classList.add('active')

	button.onclick = (e) => {
		document.querySelectorAll(`.radio-button.${group}`).forEach(e => e.classList.remove('active'))
		button.classList.add('active')
		onclick(e)
	}

	return button
}

function updateThemeOptionsContainers() {
	lightThemeOptionsContainer.replaceChildren()
	darkThemeOptionsContainer.replaceChildren()
	for (const theme of themes) {		
		if (!theme.isDarkTheme) {
			const button = createRadioButton('light-theme-option', theme.displayName, () => {
				currentLightTheme = theme.name
				localStorage.setItem('active-light-theme', theme.name)
				applyCurrentTheme()
			}, currentLightTheme == theme.name)
			if (useDarkTheme) button.classList.add('slightly-hidden')
			lightThemeOptionsContainer.append(button)
		} else {
			const button = createRadioButton('dark-theme-option', theme.displayName, () => {
				currentDarkTheme = theme.name
				localStorage.setItem('active-dark-theme', theme.name)
				applyCurrentTheme()
			}, currentDarkTheme == theme.name)
			if (!useDarkTheme) button.classList.add('slightly-hidden')
			darkThemeOptionsContainer.append(button)
		}
	}
}

// Mostly copied from https://stackoverflow.com/a/17243070 because I'm lazy
function HSVAtoRGBA(hsva) {
    let r, g, b, i, f, p, q, t;
	const [h, s, v, a] = hsva
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), Math.round(a * 255)]
}
function RGBAtoHSVA(rgba) {
    const [r, g, b, a] = rgba
	let max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

	return [h, s, v, a / 255]
}

// Somewhat copied from https://stackoverflow.com/a/39077686 because I haven't stopped being lazy
const RGBAToHex = rgba => rgba.map(x => x.toString(16).padStart(2, '0')).join('')
const HexToRGBA = hex => {
	if (hex.startsWith('#')) hex = hex.substring(1)
	switch (hex.length) {
		case 3:
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + 'FF'
			break;
		case 4:
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
			break;
		case 6:
			hex += 'FF'
			break;
	}

	const bigint = parseInt(hex, 16)
	return [bigint >> 24 & 255, bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255]
}

function applyCurrentTheme() {
	const theme = getTheme(useDarkTheme ? currentDarkTheme : currentLightTheme)

	const fallback = getTheme(theme.fallback)

	for (const variableName in fallback.colors) {
		if (theme && Object.hasOwn(theme.colors, variableName)) {
			rootElement.style.setProperty('--' + variableName, '#' + theme.colors[variableName])
			if (variableName == 'background') themeColorMetaTag.setAttribute('content', '#' + theme.colors[variableName])
		} else {
			rootElement.style.setProperty('--' + variableName, '#' + fallback.colors[variableName])
			if (variableName == 'background') themeColorMetaTag.setAttribute('content', '#' + fallback.colors[variableName])
		}
	}
	currentThemeChange()
}


function letUserChangeCSSVariableColor(themeName, cssVariableName) {
	if (getTheme(themeName).isDarkTheme == useDarkTheme) {
		if (useDarkTheme) {
			currentDarkTheme = 'custom-dark'
		} else {
			currentLightTheme = 'custom-light'
		}
		updateThemeOptionsContainers()
	}

	applyCurrentTheme()

	const cssProperty = '--' + cssVariableName
	const colorPicker = document.createElement('form')
	const rangeContainer = document.createElement('div')
	rangeContainer.className = 'range-container'
	colorPicker.classList.add('color-picker')

	const createColorRange = (name, defaultValue) => {
		const input = document.createElement('input')
		input.type = 'range'
		input.min = '0'
		input.max = '100'
		input.value = defaultValue
		input.name = name

		const label = document.createElement('label')
		label.htmlFor = name
		label.textContent = name.substring(0, 1).toUpperCase() + name.substring(1)

		return [label, input]
	}

	// Umm... yeah I have no defense for this
	const oldHSVA = RGBAtoHSVA(HexToRGBA(getTheme(useDarkTheme ? 'custom-dark' : 'custom-light').colors[cssVariableName] ?? getTheme(getTheme(useDarkTheme ? 'custom-dark' : 'custom-light').fallback).colors[cssVariableName]))

	const [hueLabel, hueInput] = createColorRange('hue', oldHSVA[0] * 100)
	const [saturationLabel, saturationInput] = createColorRange('saturation', oldHSVA[1] * 100)
	const [valueLabel, valueInput] = createColorRange('value', oldHSVA[2] * 100)
	const [alphaLabel, alphaInput] = createColorRange('alpha', oldHSVA[3] * 100)

	let [h, s, v, a] = [hueInput.value / 100, saturationInput.value / 100, valueInput.value / 100, alphaInput.value / 100]

	const setCSSProperty = (h, s, v, a) => {
		rootElement.style.setProperty(cssProperty, '#' + RGBAToHex(HSVAtoRGBA([h, s, v, a])))
	}

	setCSSProperty(h, s, v, a)

	hueInput.oninput = (e) => {
		const newValue = e.target.value
		h = newValue / 100
		setCSSProperty(h, s, v, a)
	}
	saturationInput.oninput = (e) => {
		const newValue = e.target.value
		s = newValue / 100
		setCSSProperty(h, s, v, a)
	}
	valueInput.oninput = (e) => {
		const newValue = e.target.value
		v = newValue / 100
		setCSSProperty(h, s, v, a)
	}
	alphaInput.oninput = (e) => {
		const newValue = e.target.value
		a = newValue / 100
		setCSSProperty(h, s, v, a)
	}

	optionsDialog.close()
	optionsMenuOpenButton.toggleAttribute('hidden')
	themeOptionsContainer.append(colorPicker)
	themeOptionsContainer.style.display = 'unset'
	rootElement.style.setProperty('--compact-ui', '1')

	const acceptButton = document.createElement('button')
	acceptButton.type = 'button'
	acceptButton.textContent = 'Accept'
	acceptButton.classList.add('accept-button')
	acceptButton.onclick = () => {
		colorPicker.remove()
		optionsDialog.showModal()
		themeOptionsContainer.style.display = 'none'
		getTheme(themeName).colors[cssVariableName] = RGBAToHex(HSVAtoRGBA([h, s, v, a]))
		localStorage.setItem(`theme.${useDarkTheme ? 'dark' : 'light'}.${themeName}.${cssVariableName}`, RGBAToHex(HSVAtoRGBA([h, s, v, a])))
		applyCurrentTheme()
		rootElement.style.setProperty('--compact-ui', '0')
		optionsMenuOpenButton.toggleAttribute('hidden')
	}


	rangeContainer.append(hueLabel, hueInput, saturationLabel, saturationInput, valueLabel, valueInput, alphaLabel, alphaInput)
	colorPicker.append(rangeContainer, acceptButton)
}

function loadThemes() {
	Object.keys(localStorage).forEach(key => {
		const splitkey = key.split('.')
		if (splitkey.length != 4) return
		
		if (!splitkey[0] == 'theme') return
		
		const [fallback, themeName, property] = splitkey.slice(1)

		if (!themes.map(i => i.name).includes(themeName)) themes.push({name: themeName, fallback: fallback, isDarkTheme: getTheme(fallback).isDarkTheme, colors: {}})

		getTheme(themeName).colors[property] = localStorage.getItem(key)
	})
}

function getTheme(themeName) {
	const results = themes.filter(i => i.name == themeName)
	if (results.length) {
		return results[0]
	}
}


function resetTheme(themeToReset) {
	const theme = getTheme(themeToReset)
	const fallbackTheme = getTheme(theme.fallback)
	theme.colors = structuredClone(fallbackTheme.colors)

	Object.keys(localStorage).forEach(key => {
		const splitkey = key.split('.')
		if (splitkey.length != 4) return
		
		if (!splitkey[0] == 'theme') return
		
		const [fallback, themeName, property] = splitkey.slice(1)

		if (themeName != themeToReset) return

		localStorage.removeItem(key)
	})
	applyCurrentTheme()
}

loadThemeOverride()
loadCurrentLightAndDarkThemes()
loadThemes()

createThemeOverrideOptions()
updateThemeOptionsContainers()
updatePrefersDark()
applyCurrentTheme()
updateCustomizeCurrentTheme()