const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to get the type of changes from git diff
function getChangeType() {
    try {
        // Get the diff of staged files
        const diff = execSync('git diff --cached --name-only').toString();
        const files = diff.split('\n').filter(Boolean);
        
        // If no files are staged, check unstaged files
        if (files.length === 0) {
            const unstagedDiff = execSync('git diff --name-only').toString();
            files.push(...unstagedDiff.split('\n').filter(Boolean));
        }

        // Define patterns for different types of changes
        const breakingPatterns = [
            /^android\/app\/build\.gradle$/,  // Android configuration changes
            /^ios\/.*\.xcodeproj\/project\.pbxproj$/,  // iOS project changes
            /package\.json$/  // Dependencies changes
        ];

        const featurePatterns = [
            /^src\/(screen|components)\/.*\.(js|tsx?)$/,  // New screens or components
            /^src\/services\/.*\.(js|tsx?)$/  // New services
        ];

        // Check for breaking changes first
        if (files.some(file => breakingPatterns.some(pattern => pattern.test(file)))) {
            return 'major';
        }

        // Then check for feature changes
        if (files.some(file => featurePatterns.some(pattern => pattern.test(file)))) {
            return 'minor';
        }

        // Default to patch for all other changes
        return 'patch';
    } catch (error) {
        console.error('Error analyzing git changes:', error);
        return 'patch'; // Default to patch on error
    }
}

// Function to update version in a file
function updateVersion(filePath, currentVersion, type) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    let newVersion;
    switch(type) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
        default:
            newVersion = currentVersion;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    return newVersion;
}

// Main execution
try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    const changeType = getChangeType();
    console.log(`Detected change type: ${changeType}`);
    
    const newVersion = updateVersion(packageJsonPath, currentVersion, changeType);
    updateVersion(appJsonPath, currentVersion, changeType);
    
    console.log(`Version updated from ${currentVersion} to ${newVersion}`);
    
    // Stage the updated files
    execSync('git add package.json app.json');
} catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
}