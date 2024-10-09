import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, NativeSyntheticEvent, TextInputKeyPressEventData, TextInput as RNTextInput } from 'react-native';
import { TextInput } from 'react-native-paper';

interface VerificationInputProps {
  length: number;
  onChange: (code: string) => void;
}
// test 
const VerificationInput: React.FC<VerificationInputProps> = ({ length, onChange }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(React.RefObject<RNTextInput>)[]>(Array(length).fill(null).map(() => React.createRef<RNTextInput>()));

  const processInput = (text: string, slot: number) => {
    if (/[^0-9]/.test(text)) return;
    const newCode = [...code];
    newCode[slot] = text;
    setCode(newCode);
    if (slot !== length - 1 && text) {
      inputs.current[slot + 1]?.current?.focus();
    }
    onChange(newCode.join(''));
  };

  const onKeyUp = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, slot: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[slot] && slot !== 0) {
      const newCode = [...code];
      newCode[slot - 1] = '';
      setCode(newCode);
      inputs.current[slot - 1]?.current?.focus();
      onChange(newCode.join(''));
    }
  };

  return (
    <View style={styles.inputContainer}>
      {code.map((num, idx) => (
        <TextInput
          key={idx}
          mode="outlined"
          style={styles.input}
          value={num}
          keyboardType="numeric"
          maxLength={1}
          autoFocus={!code[0].length && idx === 0}
          onChangeText={(text) => processInput(text, idx)}
          onKeyPress={(e) => onKeyUp(e, idx)}
          ref={inputs.current[idx]}
        />
      ))}
    </View>
  );
};

const VerificationCodePage: React.FC = () => {
  const [code, setCode] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingrese el Código de Verificación</Text>
      <VerificationInput length={6} onChange={setCode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    width: 40,
    height: 40,
    textAlign: 'center',
    marginHorizontal: 8,
  },
});

export default VerificationCodePage;