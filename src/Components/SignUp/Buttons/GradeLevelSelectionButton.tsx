import React, { useState, ReactElement } from 'react';
import { IndexPath, Layout, Select, SelectItem } from '@ui-kitten/components';
import { Image } from 'react-native';
import signup from '../../../UI_Designs/SignUpStyles';

interface GradeLevelDropDownSelectionProps {
  onSelect?: (value: number) => void;
}
export default function GradeLevelDropDownSelection({ onSelect }: GradeLevelDropDownSelectionProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(new IndexPath(0));

  const gradeLevel = ['Grade 1', 'Grade 2', 'Grade 3'];

  const handleSelect = (index: IndexPath | IndexPath[]) => {
    const actualIndex = Array.isArray(index) ? index[0] : index;
    setSelectedIndex(actualIndex);
    const grade = gradeLevel[actualIndex.row];
    const gradeNumber = parseInt(grade.replace(/\D/g, ''), 10);
    if (onSelect && !isNaN(gradeNumber)) {
      onSelect(gradeNumber);
    }
  };

  const displayValue = Array.isArray(selectedIndex)
    ? gradeLevel[selectedIndex[0]?.row] || gradeLevel[0]
    : gradeLevel[selectedIndex.row] || gradeLevel[0];

  const renderIcon = (_props: any) => (
    <Image
      source={require('../../../../assets/icons/Edit-icon.png')}
      style={[signup.inputIcon, { marginTop: 0 }]}
    />
  );

  return (
    <Layout style={signup.dropdownContainer}>
      <Select
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        value={displayValue}
        placeholder='Select Grade Level'
        accessoryLeft={renderIcon}
        style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
      >
        {gradeLevel.map((grade, index) => (
          <SelectItem key={index} title={grade} />
        ))}
      </Select>
    </Layout>
  );
}
