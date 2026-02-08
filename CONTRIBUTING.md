# Contributing to Support Portal

Thank you for your interest in contributing! This document provides guidelines for contributing to the Support Portal project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/support-portal.git`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test thoroughly
6. Commit and push
7. Open a Pull Request

## Development Setup

See [QUICKSTART.md](./QUICKSTART.md) for setup instructions.

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types
- Handle loading and error states
- Make components accessible

### CSS

- Use existing CSS classes when possible
- Support both light and dark themes
- Make layouts responsive
- Use meaningful class names
- Follow BEM naming convention when applicable

## Commit Messages

Follow conventional commits format:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

Examples:
- `feat: add image compression for uploads`
- `fix: resolve code block copy button not working`
- `docs: update API documentation for new endpoint`

## Pull Request Process

1. **Update Documentation:** If you add features, update relevant docs
2. **Test Your Changes:** Ensure all features work as expected
3. **Keep PRs Focused:** One feature/fix per PR
4. **Describe Your Changes:** Provide a clear description in the PR
5. **Link Issues:** Reference any related issues

## Testing

Before submitting a PR:

1. Run the linter: `npm run lint`
2. Build the project: `npm run build`
3. Test manually using [TESTING.md](./TESTING.md) checklist
4. Test in multiple browsers if UI changes
5. Test both light and dark themes

## Areas for Contribution

### High Priority

- [ ] Add line numbers to code blocks
- [ ] Implement email rendering for rich content
- [ ] Add authentication to API endpoints
- [ ] Implement virus scanning for uploads
- [ ] Add comprehensive unit tests
- [ ] Performance optimizations
- [ ] Mobile responsiveness improvements

### Medium Priority

- [ ] Add more TipTap extensions (callouts, footnotes)
- [ ] Implement link preview card UI
- [ ] Add PDF preview for attachments
- [ ] Implement mention notifications
- [ ] Add emoji picker integration
- [ ] Improve error handling and messages
- [ ] Add loading skeletons

### Low Priority

- [ ] Add keyboard shortcuts help modal
- [ ] Implement undo/redo stack visualization
- [ ] Add word count display
- [ ] Theme customization options
- [ ] Export content as PDF/Markdown
- [ ] Add content versioning

## File Organization

When adding new features:

### Backend (API)
- Routes: `apps/api/src/routes/`
- Utilities: `apps/api/src/utils/`
- Middleware: `apps/api/src/middleware/`

### Frontend (Web)
- Components: `apps/web/components/[category]/`
- Pages: `apps/web/app/[route]/`
- Styles: `apps/web/styles/`
- Utilities: `apps/web/lib/` or `apps/web/utils/`

### Shared
- Types: `packages/shared/src/types/`
- Constants: `packages/shared/src/constants/`
- Utilities: `packages/shared/src/utils/`

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `RichTextEditor.tsx`)
- Utilities: `kebab-case.ts` (e.g., `file-utils.ts`)
- Pages: `kebab-case/page.tsx` (e.g., `preview/page.tsx`)

### Variables
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Variables: `camelCase` (e.g., `uploadedFiles`)
- Components: `PascalCase` (e.g., `FileUpload`)
- Types/Interfaces: `PascalCase` (e.g., `AttachmentUploadResponse`)

## Security

When contributing, keep security in mind:

- **Never commit secrets** or API keys
- **Validate all inputs** on both client and server
- **Sanitize HTML** before rendering
- **Check file types** and sizes
- **Use parameterized queries** to prevent SQL injection
- **Implement rate limiting** for APIs
- **Use HTTPS** in production

## Performance

Consider performance when adding features:

- **Lazy load** large components
- **Optimize images** before upload
- **Use pagination** for large lists
- **Debounce** expensive operations
- **Cache** frequently accessed data
- **Minimize bundle size**

## Accessibility

Make features accessible:

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios
- Provide text alternatives for images

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues on GitHub
3. Open a new issue with the "question" label
4. Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You! 🙏

Every contribution, no matter how small, makes this project better. Thank you for taking the time to contribute!
