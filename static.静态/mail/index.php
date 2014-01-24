<?php
define("USER", "");
define("PASSWORD", "");
define("MAILTO", "");

function output_alert($words) {
  die('<script>alert("'.$words.'");window.history.back(-1);</script>');
}

function output_message($words) {
  die('<script>alert("'.$words.'");window.location.href="/";</script>');
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  if (isset($_POST['firstname']) && strlen($_POST['firstname'])>0 && strlen($_POST['firstname'])<20) {
    $firstname = $_POST['firstname'];
    if (isset($_POST['lastname']) && strlen($_POST['lastname'])>0 && strlen($_POST['lastname'])<20) {
      $lastname = $_POST['lastname'];
      if (isset($_POST['company']) && strlen($_POST['company'])>100) {
        output_alert('Invalid Company. Length should be between 1-100.');
      }
      $company = isset($_POST['company'])?$_POST['company']:'';

      if (isset($_POST['website']) && strlen($_POST['website'])>100) {
        output_alert('Invalid Website. Length should be between 1-100.');
      }
      $website = isset($_POST['website'])?$_POST['website']:'';

      if (isset($_POST['country']) && strlen($_POST['country'])>100) {
        output_alert('Invalid Country. Length should be between 1-100.');
      }
      $country = isset($_POST['country'])?$_POST['country']:'';

      if (isset($_POST['telephone']) && strlen($_POST['telephone'])>30) {
        output_alert('Invalid Telephone. Length should be between 1-30.');
      }
      $telephone = isset($_POST['telephone'])?$_POST['telephone']:'';

      if (isset($_POST['fax']) && strlen($_POST['fax'])>30) {
        output_alert('Invalid Fax. Length should be between 1-30.');
      }
      $fax = isset($_POST['fax'])?$_POST['fax']:'';
      if (isset($_POST['email']) && strlen($_POST['email'])>0 && strlen($_POST['email'])<100 && preg_match('/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/', $_POST['email'])) {
        $email = $_POST['email'];
        if (isset($_POST['content']) && strlen($_POST['content'])>0 && strlen($_POST['content'])<50000) {
          $content = $_POST['content'];
        } else {
          output_alert('Invalid Content. Length should be between 1-50000.');
        }
      } else {
        output_alert('Invalid Email. Length should be between 1-100 and it should look like \'example@example.com\'.');
      }
    } else {
      output_alert('Invalid Last Name. Length should be between 1-20.');
    }
  } else {
    output_alert('Invalid First Name. Length should be between 1-20.');
  }

  if (!empty($_SERVER["HTTP_CLIENT_IP"])) {
    $ip = $_SERVER["HTTP_CLIENT_IP"];
  } elseif (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
    $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
  } else {
    $ip = $_SERVER["REMOTE_ADDR"];
  }

  function PHPMailerAutoload($classname) {
    $filename = dirname(__FILE__).DIRECTORY_SEPARATOR.'class.'.strtolower($classname).'.php';
    if (is_readable($filename)) {
      require $filename;
    }
  }

  if (version_compare(PHP_VERSION, '5.1.2', '>=')) {
    if (version_compare(PHP_VERSION, '5.3.0', '>=')) {
      spl_autoload_register('PHPMailerAutoload', true, true);
    } else {
      spl_autoload_register('PHPMailerAutoload');
    }
  } else {
    function __autoload($classname) {
      PHPMailerAutoload($classname);
    }
  }

  $mail = new PHPMailer;
  $mail->SMTPDebug = 0;
  $mail->isSMTP();
  $mail->Host = 'smtp.163.com';
  $mail->Port = 25;
  $mail->SMTPAuth = true;
  $mail->Username = USER;
  $mail->Password = PASSWORD;

  $mail->From = USER . '@163.com';
  $mail->FromName = USER . '@163.com';
  $mail->addAddress(MAILTO);

  $mail->WordWrap = 50;
  $mail->isHTML(false);

  $mail->Subject = "New micze.com contact us information";
  $mail->Body    = "First Name: $firstname\nLast Name: $lastname\nCompany: $company\nWebsite: $website\nCountry: $country\nIP Address: $ip\nTelephone: $telephone\nFax: $fax\nEmail: $email\nContent: $content";

  if(!$mail->send()) {
    output_alert('Error occurred.');
    // echo 'Message could not be sent.';
    // echo 'Mailer Error: ' . $mail->ErrorInfo;
    // exit;
  }

  output_message('Congratulations! You message has been sent. We\'ll contact you soon.');

} else {
  header("Location: /");
}
