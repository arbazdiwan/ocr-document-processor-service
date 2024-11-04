// Regular expressions for different fields
const patterns = {
  // PAN format: ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
  panNumber: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,

  // Name format: 2-3 uppercase words, min 2 chars each
  // Matches: JOHN MICHAEL SMITH, ARBAZ DIWAN
  //   name: /^[A-Z]{2,}(?:\s+[A-Z]{2,}){1,2}$/,
  name: /([A-Z]{2,}(?:\s+[A-Z]{2,}){1,2})/,

  // Date format: DD/MM/YYYY
  // Validates basic date format with optional leading zeros
  //   dateOfBirth: /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([1-2][0-9]{3})$/,
  dateOfBirth: /([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([1-2][0-9]{3})/,

  // Keywords that typically precede father's name
  fatherPrefix: /father|fathers|father's|Father|Fathers|Father's|फिता|पिता/i,
};

// Helper function to get previous non-empty line
const getPreviousNonEmptyLine = (textLines, currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    const line = cleanText(textLines[i])?.trim();
    if (line && line.length > 0) {
      return line;
    }
  }
  return "";
};

const isFullNameLineMatch = (value, originalLine, prevNonEmptyLine) => {
  if (
    !value &&
    !patterns.fatherPrefix.test(prevNonEmptyLine) &&
    !patterns.fatherPrefix.test(originalLine)
  ) {
    return true;
  }
  return false;
};

const isFatherNameLineMatch = (value, originalLine, prevNonEmptyLine) => {
  if (
    !value &&
    (patterns.fatherPrefix.test(prevNonEmptyLine) ||
      patterns.fatherPrefix.test(originalLine))
  ) {
    return true;
  }
  return false;
};

const isDateOfBirthLineMatch = (dobMatch) => {
  if (!dobMatch) return false;

  const [day, month, year] = dobMatch[0].split("/").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  ) {
    return true;
  }
  return false;
};

// Helper function to clean text
const cleanText = (text) => {
  return text.replace(/[^\w\s\/]/gi, "").trim();
};

export const parsePanCardData = (textLines) => {
  try {
    // Initialize default response structure
    const result = {
      fullName: null,
      fatherName: null,
      dateOfBirth: null,
      panNumber: null,
      documentName: "Permanent Account Number Card", // this can be computed. keeping it simple for now
      issuingAuthority: "Income Tax Department, Govt. of India",
    };

    // Process each line and extract data
    textLines.forEach((line, index) => {
      const cleanedLine = cleanText(line);
      const originalLine = line.trim();

      // Skip empty lines
      if (!originalLine) return;

      // Match PAN Number
      const panMatch = originalLine.match(patterns.panNumber);
      if (panMatch && !result.panNumber) {
        result.panNumber = panMatch[0];
      }
      // Match Full Name
      else if (patterns.name.test(cleanedLine) && result.panNumber) {
        const prevNonEmptyLine = getPreviousNonEmptyLine(textLines, index);

        // if it's not a father's name line and we haven't found a name yet
        if (
          isFullNameLineMatch(result.fullName, originalLine, prevNonEmptyLine)
        ) {
          const nameValues = patterns.name.exec(cleanedLine);
          result.fullName = nameValues[0] || cleanedLine;
        }
        // Match Father's Name
        else if (
          isFatherNameLineMatch(
            result.fatherName,
            originalLine,
            prevNonEmptyLine
          )
        ) {
          const nameValues = patterns.name.exec(cleanedLine);
          result.fatherName = nameValues[0] || cleanedLine;
        }
      } else {
        // Match Date of Birth
        const dobMatch = originalLine.match(patterns.dateOfBirth);
        // Validate date
        if (!result.dateOfBirth && isDateOfBirthLineMatch(dobMatch)) {
          result.dateOfBirth = dobMatch[0];
        }
      }
    });

    // Validate and format response
    const parsedResult = {
      success: true,
      data: {
        ...result,
        confidence: {
          panNumber: result.panNumber ? "high" : "not_found",
          fullName: result.fullName ? "high" : "not_found",
          fatherName: result.fatherName ? "high" : "not_found",
          dateOfBirth: result.dateOfBirth ? "high" : "not_found",
        },
      },
    };

    return parsedResult;
  } catch (error) {
    console.error("Error parsing PAN card data:", error);
    return {
      success: false,
      message: "Failed to parse PAN card data",
      data: null,
    };
  }
};
