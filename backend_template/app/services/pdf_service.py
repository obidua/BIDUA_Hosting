"""
PDF Invoice Generation Service
Generates professional PDF invoices for server purchases
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from typing import Dict, Any, Optional
from decimal import Decimal
import io
import os


class PDFInvoiceService:
    """Service for generating PDF invoices"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._register_unicode_font()
        self._setup_custom_styles()
    
    def _register_unicode_font(self):
        """Register a Unicode font that supports the rupee symbol"""
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        
        self.unicode_font = None
        
        # Try to register fonts that support the rupee symbol
        font_paths = [
            # Try DejaVu Sans (commonly available on Linux)
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/dejavu/DejaVuSans.ttf',
            # Try Noto Sans
            '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
            '/usr/share/fonts/noto/NotoSans-Regular.ttf',
            # Try FreeSans
            '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('UnicodeFont', font_path))
                    self.unicode_font = 'UnicodeFont'
                    print(f"✅ Registered Unicode font: {font_path}")
                    break
                except Exception as e:
                    print(f"⚠️ Failed to register font {font_path}: {e}")
        
        if not self.unicode_font:
            print("⚠️ No Unicode font found, using INR prefix for currency")
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Company name style
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#4F46E5'),
            spaceAfter=6,
            alignment=TA_LEFT
        ))
        
        # Invoice title style
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=12,
            alignment=TA_RIGHT
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#374151'),
            spaceAfter=6,
            spaceBefore=12,
            alignment=TA_LEFT
        ))
    
    def _format_currency(self, amount: Decimal) -> str:
        """Format currency value - using INR prefix for PDF compatibility"""
        # Use 'INR ' prefix for PDF since not all fonts support ₹ symbol
        return f"INR {float(amount):,.2f}"
    
    def _format_date(self, date: datetime) -> str:
        """Format datetime to readable date string"""
        if date:
            return date.strftime("%B %d, %Y")
        return "N/A"
    
    def generate_invoice_pdf(
        self,
        invoice_data: Dict[str, Any],
        order_data: Dict[str, Any],
        user_data: Dict[str, Any],
        server_config: Optional[Dict[str, Any]] = None,
        addons: Optional[list] = None
    ) -> bytes:
        """
        Generate PDF invoice
        
        Args:
            invoice_data: Invoice details (number, date, amounts, etc.)
            order_data: Order details (order number, payment info, etc.)
            user_data: Customer details (name, email, etc.)
            server_config: Server configuration details
            addons: List of addon details
        
        Returns:
            bytes: PDF file content
        """
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Container for PDF elements
        elements = []
        
        # ========== HEADER ==========
        # Company info
        company_name = Paragraph("BIDUA Hosting", self.styles['CompanyName'])
        elements.append(company_name)
        
        company_info = Paragraph(
            "Professional Cloud Hosting Solutions<br/>"
            "Email: support@biduahosting.com<br/>"
            "Website: www.biduahosting.com",
            self.styles['Normal']
        )
        elements.append(company_info)
        elements.append(Spacer(1, 0.3*inch))
        
        # Invoice title and number
        invoice_title = Paragraph(
            f"<b>INVOICE</b><br/>{invoice_data.get('invoice_number', 'N/A')}",
            self.styles['InvoiceTitle']
        )
        elements.append(invoice_title)
        elements.append(Spacer(1, 0.2*inch))
        
        # ========== CUSTOMER & INVOICE INFO ==========
        info_data = [
            ['Bill To:', '', 'Invoice Date:', self._format_date(invoice_data.get('invoice_date'))],
            [user_data.get('full_name', 'N/A'), '', 'Order Number:', order_data.get('order_number', 'N/A')],
            [user_data.get('email', 'N/A'), '', 'Payment Date:', self._format_date(order_data.get('paid_at'))],
            ['', '', 'Payment Method:', order_data.get('payment_method', 'Razorpay').title()],
        ]
        
        if order_data.get('razorpay_payment_id'):
            info_data.append(['', '', 'Payment Ref:', order_data.get('razorpay_payment_id', 'N/A')])
        
        info_table = Table(info_data, colWidths=[2*inch, 1*inch, 1.2*inch, 2*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#374151')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # ========== SERVER CONFIGURATION ==========
        if server_config:
            elements.append(Paragraph("Server Configuration", self.styles['SectionHeader']))
            
            config_data = [
                ['Item', 'Specification'],
                ['Server Type', server_config.get('server_type', 'VPS')],
                ['CPU Cores', f"{server_config.get('vcpu', 'N/A')} vCPU"],
                ['RAM', f"{server_config.get('ram_gb', 'N/A')} GB"],
                ['Storage', f"{server_config.get('storage_gb', 'N/A')} GB SSD"],
                ['Bandwidth', f"{server_config.get('bandwidth_gb', 'N/A')} GB"],
                ['Operating System', server_config.get('operating_system', 'N/A')],
                ['Billing Cycle', server_config.get('billing_cycle', 'Monthly').title()],
            ]
            
            config_table = Table(config_data, colWidths=[2.5*inch, 3.5*inch])
            config_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(config_table)
            elements.append(Spacer(1, 0.2*inch))
        
        # ========== ADDONS (if any) ==========
        if addons and len(addons) > 0:
            elements.append(Paragraph("Additional Services", self.styles['SectionHeader']))
            
            addon_data = [['Service', 'Quantity', 'Unit Price', 'Amount']]
            for addon in addons:
                addon_data.append([
                    addon.get('addon_name', 'N/A'),
                    str(addon.get('quantity', 1)),
                    self._format_currency(Decimal(str(addon.get('unit_price', 0)))),
                    self._format_currency(Decimal(str(addon.get('subtotal', 0))))
                ])
            
            addon_table = Table(addon_data, colWidths=[2.5*inch, 1*inch, 1.25*inch, 1.25*inch])
            addon_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(addon_table)
            elements.append(Spacer(1, 0.2*inch))
        
        # ========== BILLING SUMMARY ==========
        elements.append(Paragraph("Billing Summary", self.styles['SectionHeader']))
        
        subtotal = Decimal(str(invoice_data.get('subtotal', 0)))
        tax_amount = Decimal(str(invoice_data.get('tax_amount', 0)))
        discount_amount = Decimal(str(order_data.get('discount_amount', 0)))
        total_amount = Decimal(str(invoice_data.get('total_amount', 0)))
        
        billing_data = [
            ['Subtotal:', self._format_currency(subtotal)],
        ]
        
        if discount_amount > 0:
            billing_data.append(['Discount:', f"- {self._format_currency(discount_amount)}"])
        
        if tax_amount > 0:
            # Calculate tax rate safely, avoiding division by zero
            if subtotal > 0:
                tax_rate = (tax_amount / subtotal * 100)
            else:
                tax_rate = 18  # Default GST rate
            billing_data.append([f'Tax ({tax_rate:.0f}% GST):', self._format_currency(tax_amount)])
        
        billing_data.append(['', ''])  # Separator
        
        # Use Paragraph for Total Amount to enable bold formatting
        total_label_style = ParagraphStyle(
            name='TotalLabel',
            parent=self.styles['Normal'],
            fontSize=12,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )
        total_value_style = ParagraphStyle(
            name='TotalValue',
            parent=self.styles['Normal'],
            fontSize=12,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT,
            textColor=colors.HexColor('#4F46E5')
        )
        billing_data.append([
            Paragraph('Total Amount:', total_label_style),
            Paragraph(self._format_currency(total_amount), total_value_style)
        ])
        
        billing_table = Table(billing_data, colWidths=[4.5*inch, 1.5*inch])
        billing_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#4F46E5')),
            ('TOPPADDING', (0, 0), (-1, -2), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -2), 4),
            ('TOPPADDING', (0, -1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
        ]))
        elements.append(billing_table)
        elements.append(Spacer(1, 0.4*inch))
        
        # ========== FOOTER ==========
        footer_text = Paragraph(
            "<b>Thank you for your business!</b><br/><br/>"
            "For support inquiries, please contact us at:<br/>"
            "Email: support@biduahosting.com | Phone: +91-XXXX-XXXXXX<br/><br/>"
            "<i>This is a computer-generated invoice and does not require a signature.</i>",
            self.styles['Normal']
        )
        elements.append(footer_text)
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def save_invoice_pdf(
        self,
        pdf_content: bytes,
        invoice_number: str,
        output_dir: str = None
    ) -> str:
        """
        Save PDF to file system
        
        Args:
            pdf_content: PDF file content
            invoice_number: Invoice number for filename
            output_dir: Directory to save PDF (defaults to system temp + /invoices)
        
        Returns:
            str: Path to saved PDF file
        """
        import tempfile
        
        # Use system temp directory if not specified
        if output_dir is None:
            output_dir = os.path.join(tempfile.gettempdir(), "invoices")
        
        # Create directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        filename = f"{invoice_number}.pdf"
        filepath = os.path.join(output_dir, filename)
        
        # Write PDF to file
        with open(filepath, 'wb') as f:
            f.write(pdf_content)
        
        return filepath


# Singleton instance
pdf_service = PDFInvoiceService()
