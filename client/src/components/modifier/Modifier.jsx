import React from 'react'
import { FaInfoCircle, FaPlay, FaPause, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'
import './modifier.scss'

export default function Modifier({setModifiers, refKey, modifiers}) {

  const toggleModifier = (modifier, newValue, isDisabled) => {
    let currentState = JSON.parse(JSON.stringify(modifiers)); // get a new copy

    currentState[modifier].value = newValue;
    currentState[modifier].disabled = isDisabled; 
    
    setModifiers(currentState);
  }
  
  return (    
    <div key={refKey} className='modifier'>
    <span className='toggle' onClick={(e) => { toggleModifier(refKey, modifiers[refKey].value, !modifiers[refKey].disabled) }}>{modifiers[refKey].disabled ? 
    
      <FaToggleOff className='toggle-off'/> : 
      <FaToggleOn  className='toggle-on'/>}
    </span>
        <label className={modifiers[refKey].disabled ? 'disabled' : ''} htmlFor={`target_${refKey}`} onClick={(e) => { toggleModifier(refKey, modifiers[refKey].value, !modifiers[refKey].disabled) }}>{refKey.charAt(0).toUpperCase() + refKey.slice(1)}</label>
        <input type='range' id={`target_${refKey}`} min={modifiers[refKey].min} max={modifiers[refKey].max} step={modifiers[refKey].step} value={modifiers[refKey].value} onChange={(e) => { toggleModifier(refKey, e.target.value, modifiers[refKey].disabled) }} disabled={modifiers[refKey].disabled}/>
        {/* <span className='value' id={`${key}_value`}>{val.value}</span> */}
    </div>)
}
