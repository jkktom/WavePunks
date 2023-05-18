import React, { useEffect, useRef } from 'react';
import InputMask from 'inputmask';

const MaskedInput = ({ mask, value, onChange, placeholder, className }) => {
  const inputRef = useRef();

  useEffect(() => {
    const maskInstance = InputMask(mask, { "placeholder": placeholder });
    maskInstance.mask(inputRef.current);

    // Cleanup the instance when component is unmounted
    return () => maskInstance.remove();
  }, [mask, placeholder]);

  return <input ref={inputRef} value={value} onChange={onChange} className={className} />;
};
export default MaskedInput;