import React, { useState, ReactElement } from 'react';
import { IndexPath, Layout, Select, SelectItem } from '@ui-kitten/components';
import signup from '../../../UI_Designs/SignUpStyles';

interface GradeLevelDropDownSelectionProps {
  onSelect?: (value: number) => void;
}
export default function GradeLevelDropDownSelection({onSelect}: GradeLevelDropDownSelectionProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0),
  );

  const handleSelect = (index: IndexPath | IndexPath[]) => {
    const actualIndex = Array.isArray(index) ? index[0] : index;
    setSelectedIndex(actualIndex);

    // Get selected grade text
    const selectedGrade = gradeLevel[actualIndex.row];
    // Convert the 'Grade 1/2/3' to numeric number 1 which removes the text first before parsing as Integer
    const selectedGradeNumber = parseInt(selectedGrade.replace(/\D/g, ''), 10);
    // Notify parent with the number (SignUpOneScreen)
    if (onSelect && !isNaN(selectedGradeNumber)) {
      onSelect(selectedGradeNumber);
    }
  };

  const gradeLevel = ['Grade 1', 'Grade 2', 'Grade 3'];
  const displayValue = Array.isArray(selectedIndex) 
    ? gradeLevel[selectedIndex[0]?.row] || gradeLevel[0]
    : gradeLevel[selectedIndex.row] || gradeLevel[0];

  return (
    <Layout style={signup.dropdownContainer}>
      <Select
        selectedIndex={selectedIndex}
        // onSelect={index => setSelectedIndex(index as IndexPath)}
        onSelect={handleSelect}
        value={displayValue}
        placeholder='Select Grade Level'
      >
        {gradeLevel.map((grade, index) => (
          <SelectItem key={index} title={grade} />
        ))}
      </Select>
    </Layout>
  );
}
