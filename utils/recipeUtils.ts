import { RecipeId } from '../types';

export const detectRecipeFromContext = (context: string = ''): RecipeId => {
    if (context.includes('SPRITE ENGINE')) return 'spritesheet';
    if (context.includes('CINEMATIC ENGINE')) return 'cinematic';
    if (context.includes('TIMELINE ENGINE')) return 'timeline';
    if (context.includes('3D VIEW SYNTHESIS')) return 'camera';
    if (context.includes('PRO_RESTORATION')) return 'remaster';
    if (context.includes('STYLE TRANSFER PROTOCOL')) return 'styles';
    if (context.includes('CHARACTER STUDIO')) return 'character';
    return null;
};
