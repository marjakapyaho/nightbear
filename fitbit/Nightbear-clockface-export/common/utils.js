export const MIN_IN_MILLIS = 60*1000
export const RED = '#f44336'
export const YELLOW = '#ffeb3b'
export const GREEN = '#8bc34a'
export const GREY = '#1d1d1d'

// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function getBloodSugarArray(entryArray) {
  let now = Date.now()
  // TODO!!!
  let uiSpotsArray = new Array(35).join('.').split('.')
  .map((value, index) => now - (index + 1) * 5 * MIN_IN_MILLIS)
  let finalArray = new Array(35).join('.').split('.')
  .map((value, index) => ({
    time: now - (index + 1) * 5 * MIN_IN_MILLIS,
    is_raw: false
  }))
  let entryArrayInReverse = entryArray.reverse()
  let savedInsulin, savedCarbs
  entryArrayInReverse.forEach(function(entry, i) {
    let spotIndex
        
    // Find spot for entry
    uiSpotsArray.forEach(function(spotTime, index) {
      if (entry.time >= spotTime && entry.time < (spotTime + 5 * MIN_IN_MILLIS)) {
        spotIndex = index
      }
    })
    
    if (spotIndex !== undefined) {
      let insulinToAdd, carbsToAdd
      
      if (savedInsulin && (spotIndex - savedInsulin.spot < 2)) {
        insulinToAdd = savedInsulin.insulin
      }
      
      if (savedCarbs && (spotIndex - savedCarbs.spot < 2)) {
        carbsToAdd = savedCarbs.carbs
      }
      
      // Entry has sugar
      if (entry.sugar) {
        finalArray[spotIndex] = {
          s: entry.sugar,
          r: entry.is_raw ? 1 : 0,
          i: entry.insulin || insulinToAdd, 
          c: entry.carbs || carbsToAdd
        }
        savedInsulin = undefined
        savedCarbs = undefined
      }
      else if (entry.insulin) { // save insulin and carbs for next sugar entry
        savedInsulin = {
          spot: spotIndex,
          insulin: entry.insulin || (savedInsulin && savedInsulin.insulin)
        }
      }
      else if (entry.carbs) {
        savedCarbs = {
          spot: spotIndex,
          carbs: entry.carbs || (savedCarbs && savedCarbs.carbs)
        }
      }
    }
  })
  return finalArray.reverse()
}