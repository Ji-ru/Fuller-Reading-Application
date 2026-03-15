/**
 * Registry for all passage-related images.
 * Using a centralized constant ensures that adding new content 
 * only happens in one place.
 */
export const PASSAGE_IMAGES: Record<string, any> = {
    Hickory: require('../../assets/ReadingMaterial/PassageImages/Hickory.png'),
    BlackSheep: require('../../assets/ReadingMaterial/PassageImages/BlackSheep.png'),
    Humpty: require('../../assets/ReadingMaterial/PassageImages/Humpty.png'),
    ItsyBitsy: require('../../assets/ReadingMaterial/PassageImages/ItsyBitsy.png'),
    JackJill: require('../../assets/ReadingMaterial/PassageImages/JackJill.png'),
    MissPolly: require('../../assets/ReadingMaterial/PassageImages/MissPolly.png'), // Fixed typo from your snippet
    Twinkle: require('../../assets/ReadingMaterial/PassageImages/Twinkle.png'),   // Fixed typo from your snippet
  };
  
  const DEFAULT_IMAGE = require('../../assets/icons/Empty-icon.png');
  
  /**
   * Resolves a string key to a static image asset.
   * @param imageName - The key from ReadingMaterial.json
   * @returns The required image asset or a default placeholder
   */
  export const getPassageImage = (imageName: string | undefined): any => {
    if (!imageName) return DEFAULT_IMAGE;
    return PASSAGE_IMAGES[imageName] || DEFAULT_IMAGE;
  };