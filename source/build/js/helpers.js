module.exports.getRelativePathBack = function(filePath) {
  // Count the number of slashes (excluding the filename)
  const depth = filePath.split(/[/|\\]/).length - 1;
    
  // Generate "../" for each directory level
  return '..\\'.repeat(depth); 
}
