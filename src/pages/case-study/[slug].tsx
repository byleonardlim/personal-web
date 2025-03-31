const SectionedMarkdown: React.FC<SectionedMarkdownProps> = ({ content }) => {
  try {
    // Split content by h2 headings
    const sections = content.split(/(?=^## )/gm);
    
    // Store notes section separately with proper typing
    let notesSection: NotesSection | null = null;
    const mainSections: Section[] = [];
    
    sections.forEach((section: string, index: number) => {
      if (!section.trim()) return;
      
      if (!section.startsWith('## ')) {
        // This is content before any heading (intro content)
        mainSections.push({
          type: 'intro',
          content: section,
          index
        });
        return;
      }
      
      // Extract the heading and content using safer approach
      const headingMatch = section.match(/^## (.*?)$/m);
      const headingText = headingMatch?.[1]?.trim() || 'Untitled Section';
      const sectionContent = section.replace(/^## .*?$/m, '').trim();
      
      // Check if it's a notes section
      const isNotesSection = headingText.toLowerCase().includes('notes');
      
      if (isNotesSection) {
        // Using type assertion to make sure TypeScript knows this is a NotesSection
        notesSection = {
          type: 'notes' as const,
          heading: headingText,
          content: sectionContent,
          index
        };
      } else {
        mainSections.push({
          type: 'section' as const,
          heading: headingText,
          content: sectionContent,
          index
        });
      }
    });
    
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content column */}
        <div className="lg:w-2/3">
          {mainSections.length > 0 ? (
            mainSections.map((section) => {
              if (section.type === 'intro') {
                return (
                  <div key={`intro-${section.index}`} className="mb-8">
                    <ReactMarkdown components={MarkdownComponents}>
                      {section.content}
                    </ReactMarkdown>
                  </div>
                );
              } else {
                return (
                  <section key={`section-${section.index}`} className="mb-8">
                    <h2 className="text-lg font-bold mb-4 uppercase">
                      {section.heading}
                    </h2>
                    <div className="text-md leading-relaxed">
                      <ReactMarkdown components={MarkdownComponents}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </section>
                );
              }
            })
          ) : (
            // Fallback if no sections are found
            <div className="mb-8">
              <ReactMarkdown components={MarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Notes column (sticky) */}
        {notesSection && (
          <div className="lg:w-1/3 lg:my-12 order-first lg:order-last">
            <div className="sticky lg:top-8 border border-gray-100 lg:rounded-lg p-6 bg-gray-50">
              <h2 className="text-lg font-bold mb-4 text-gray-700 uppercase">
                {notesSection.heading}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed">
                <ReactMarkdown components={MarkdownComponents}>
                  {notesSection.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Fallback for any parsing errors
    console.error('Error parsing markdown content:', error);
    return (
      <div className="markdown-content">
        <ReactMarkdown components={MarkdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
};