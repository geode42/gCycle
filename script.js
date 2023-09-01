/* --------------------------------- Consts --------------------------------- */
const doubleTapDuration = 250

const speedUnits = [
	{
		name: 'm/s',
		conversionFactor: 1,
	},
	{
		name: 'mph',
		conversionFactor: 2.237,
	},
	{
		name: 'km/h',
		conversionFactor: 3.6,
	},
]

const distanceUnits = [
	{
		name: 'm',
		conversionFactor: 1,
	},
	{
		name: 'mi',
		conversionFactor: 0.000621371,
	},
	{
		name: 'km',
		conversionFactor: 0.001,
	},
]

/* -------------------------------- Functions ------------------------------- */
const getByID = id => document.getElementById(id)
const changeTextContent = (element, newText) => { if (element.textContent != String(newText)) element.textContent = String(newText) }

function roundToNDigits(val, n) {
	// Doesn't handle numbers >= 10^n
	const leftSideDigits = Math.max(Math.floor(Math.log10(val)) + 1, 1)
	const rightSideDigits = n - leftSideDigits

	return Math.round(val * Math.pow(10, rightSideDigits)) / Math.pow(10, rightSideDigits)
}

/* ------------------------------ Get elements ------------------------------ */
const errorText = getByID('error')

const geolocationInfoDialog = getByID('geolocation-info-dialog')
const geolocationInfoDialogOkayButton = getByID('geolocation-info-dialog-okay-button')

const speedText = getByID('speed')
const speedUnitText = getByID('units')

const bikeRideInfo = getByID('bike-ride-info')
const bikeRideDistanceText = getByID('bike-ride-distance')
const bikeRideUnitsText = getByID('bike-ride-units')
const bikeRideHoursText = getByID('bike-ride-hours')
const bikeRideminutesText = getByID('bike-ride-minutes')

/* ----------------------------- Error function ----------------------------- */
function showError(...data) {
	const s = data.map(i => String(i)).join(' ')

	errorText.classList.add('visible')
	errorText.textContent = s
	setTimeout(() => {
		errorText.classList.remove('visible')
	}, 2000);
}

/* ------------------- Prevent the screen from turning off ------------------ */
let wakeLockSentinal
async function aquireWakeLock() {
	try {
		wakeLockSentinal = await navigator.wakeLock.request()
	} catch ({name, message}) {
		switch (name) {
			case 'ReferenceError':
				break;
			case 'NotAllowedError':
				showError('Keep awake request rejected')
		
			default:
				break;
		}
	}
}

// Reaquire the wake lock when the app becomes visible again
// (e.g. when you switch apps then come back to this one)
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState == 'visible') {
		aquireWakeLock()
	}
})

aquireWakeLock()

/* ---------------------------------- Vars ---------------------------------- */
let speedUnitIndex = 1
let distanceUnitIndex = 1
let currentMPSSpeed = 0
let timeOfLastSpeedUpdate = 0
let toggleBikingLastTapTime = 0
let trackingBikeStats = false

const currentBikeRideInfo = {
	startTime: 0,
	distance: 0
}

function saveBikeRideStats() {
	localStorage.setItem('bike-ride-stats.start-time', String(currentBikeRideInfo.startTime))
	localStorage.setItem('bike-ride-stats.distance', String(currentBikeRideInfo.distance))
	localStorage.setItem('bike-ride-stats.tracking', String(trackingBikeStats))
}

function loadBikeRideStats() {
	currentBikeRideInfo.startTime = Number(localStorage.getItem('bike-ride-stats.start-time')) ?? 0
	currentBikeRideInfo.distance = Number(localStorage.getItem('bike-ride-stats.distance')) ?? 0
	trackingBikeStats = localStorage.getItem('bike-ride-stats.tracking') == 'true' ?? false
}

function resetBikeRideStats() {
	currentBikeRideInfo.startTime = Date.now()
	currentBikeRideInfo.distance = 0
}

// Load stats
loadBikeRideStats()
trackingBikeStats ? bikeRideInfo.classList.remove('hidden') : bikeRideInfo.classList.add('hidden')

// Toggle ride stats on double-tap
document.addEventListener('mousedown', e => {
	if (e.target.id == 'app' || e.target.classList.contains('allow-double-click')) {
		const currentTime = Date.now()
		if (currentTime - toggleBikingLastTapTime <= doubleTapDuration) {
			trackingBikeStats = !trackingBikeStats
			trackingBikeStats ? bikeRideInfo.classList.remove('hidden') : bikeRideInfo.classList.add('hidden')
			resetBikeRideStats()
			updateRideStats()
			saveBikeRideStats()
		}
		toggleBikingLastTapTime = currentTime
	}
})

// Change the speed units when you click on them
speedUnitText.onclick = () => {
	speedUnitIndex = ++speedUnitIndex % speedUnits.length
	speedUnitText.textContent = speedUnits[speedUnitIndex].name
	setSpeedText()
}
// Set the initial text
speedUnitText.textContent = speedUnits[speedUnitIndex].name

// Change the distance units when you click on them
bikeRideUnitsText.onclick = () => {
	distanceUnitIndex = ++distanceUnitIndex % distanceUnits.length
	updateRideStats()
}

function updateRideStats() {
	const distance = roundToNDigits(currentBikeRideInfo.distance * distanceUnits[distanceUnitIndex].conversionFactor, 3)
	const units = distanceUnits[distanceUnitIndex].name

	const newDuration = Date.now() - currentBikeRideInfo.startTime
	const hours = Math.floor(newDuration / 1000 / 60 / 60)
	const minutes = Math.floor(newDuration / 1000 / 60 - hours * 60)

	changeTextContent(bikeRideDistanceText, distance)
	changeTextContent(bikeRideUnitsText, units)
	
	changeTextContent(bikeRideHoursText, hours)
	changeTextContent(bikeRideminutesText, String(minutes).padStart(2, '0'))
}

function setSpeedText() {
	speedText.textContent = Math.round(currentMPSSpeed * speedUnits[speedUnitIndex].conversionFactor)
}

async function runSpeedometer() {
	timeOfLastSpeedUpdate = Date.now()
	function updateStuff(pos) {
		const currentTime = Date.now()
		currentBikeRideInfo.distance += currentMPSSpeed * (currentTime - timeOfLastSpeedUpdate) / 1000
		timeOfLastSpeedUpdate = currentTime
		currentMPSSpeed = pos.coords.speed
		setSpeedText()
		updateRideStats()
		saveBikeRideStats()
	}

	function onerr() {
		speedText.textContent = 'Error :('
	}

	navigator.geolocation.watchPosition(updateStuff, onerr, {enableHighAccuracy: true})
}

if ('geolocation' in navigator) {
	;(async () => {
		if ((await navigator.permissions.query({ name: 'geolocation' })).state != 'granted') {
			geolocationInfoDialog.showModal()
		} else {
			runSpeedometer()
		}
		geolocationInfoDialogOkayButton.onclick = e => {
			geolocationInfoDialog.close()
			runSpeedometer()
		}
	})()
} else {
	showError("Can't access Geolocation API")
}