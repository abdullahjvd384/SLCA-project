"""
Resume parser for PDF and DOCX files
"""
import PyPDF2
from docx import Document
from typing import Dict, Any, List
import re

class ResumeParser:
    """Parser for extracting structured data from resumes"""
    
    @staticmethod
    def parse_pdf(file_path: str) -> Dict[str, Any]:
        """
        Parse PDF resume
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Parsed resume data
        """
        text = ""
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
        except Exception as e:
            raise ValueError(f"Error parsing PDF: {str(e)}")
        
        return ResumeParser._extract_structured_data(text)
    
    @staticmethod
    def parse_docx(file_path: str) -> Dict[str, Any]:
        """
        Parse DOCX resume
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Parsed resume data
        """
        text = ""
        
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise ValueError(f"Error parsing DOCX: {str(e)}")
        
        return ResumeParser._extract_structured_data(text)
    
    @staticmethod
    def _extract_structured_data(text: str) -> Dict[str, Any]:
        """
        Extract structured data from resume text
        
        Args:
            text: Raw resume text
            
        Returns:
            Structured resume data
        """
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        # Extract phone numbers
        phone_pattern = r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}'
        phones = re.findall(phone_pattern, text)
        
        # Extract education keywords
        education_keywords = ['bachelor', 'master', 'phd', 'diploma', 'degree', 'university', 'college']
        education_sections = []
        for line in text.lower().split('\n'):
            if any(keyword in line for keyword in education_keywords):
                education_sections.append(line.strip())
        
        # Extract skills (common technical skills)
        skill_keywords = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue',
            'node', 'django', 'flask', 'fastapi', 'sql', 'mongodb',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'machine learning',
            'data science', 'artificial intelligence', 'deep learning',
            'tensorflow', 'pytorch', 'html', 'css', 'typescript', 'c++', 'c#'
        ]
        
        skills = []
        text_lower = text.lower()
        for skill in skill_keywords:
            if skill in text_lower:
                skills.append(skill.title())
        
        # Extract experience years (rough estimate)
        experience_pattern = r'(\d+)[\+]?\s*(?:years?|yrs?)'
        experience_matches = re.findall(experience_pattern, text.lower())
        total_experience = max([int(exp) for exp in experience_matches]) if experience_matches else 0
        
        return {
            'raw_text': text,
            'email': emails[0] if emails else None,
            'phone': phones[0] if phones else None,
            'education': education_sections[:3],  # Top 3 education entries
            'skills': list(set(skills)),  # Unique skills
            'experience_years': total_experience,
            'sections': ResumeParser._identify_sections(text)
        }
    
    @staticmethod
    def _identify_sections(text: str) -> List[str]:
        """
        Identify resume sections
        
        Args:
            text: Resume text
            
        Returns:
            List of identified sections
        """
        section_keywords = [
            'summary', 'objective', 'experience', 'education', 
            'skills', 'projects', 'certifications', 'achievements',
            'publications', 'references'
        ]
        
        identified_sections = []
        text_lower = text.lower()
        
        for section in section_keywords:
            if section in text_lower:
                identified_sections.append(section.title())
        
        return identified_sections

resume_parser = ResumeParser()
